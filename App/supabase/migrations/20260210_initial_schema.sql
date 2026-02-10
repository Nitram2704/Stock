-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  role TEXT DEFAULT 'Operator' CHECK (role IN ('Admin', 'Manager', 'Operator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In production, we'd link to auth.users:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_qr TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  unit TEXT DEFAULT 'pcs',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movements table
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL,
  operator_id UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Policies for Products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins and Managers can modify products" ON products 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

-- Policies for Movements
CREATE POLICY "Anyone can view movements" ON movements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can record movements" ON movements 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update stock on movement
CREATE OR REPLACE FUNCTION update_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.type = 'IN') THEN
    UPDATE products SET stock_actual = stock_actual + NEW.quantity WHERE id = NEW.product_id;
  ELSIF (NEW.type = 'OUT') THEN
    UPDATE products SET stock_actual = stock_actual - NEW.quantity WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for movement
CREATE TRIGGER tr_update_stock_on_movement
AFTER INSERT ON movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_movement();
