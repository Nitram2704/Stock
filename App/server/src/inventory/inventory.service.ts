import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ScanDto } from './dto/scan.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class InventoryService {
    constructor(private supabaseService: SupabaseService) { }

    async processScan(scanDto: ScanDto) {
        const client = this.supabaseService.getClient();

        // 1. Find product by SKU
        const { data: product, error: productError } = await client
            .from('products')
            .select('id, name')
            .eq('sku_qr', scanDto.sku_qr)
            .single();

        if (productError || !product) {
            throw new NotFoundException(`Product with SKU ${scanDto.sku_qr} not found`);
        }

        // 2. Insert movement (The DB trigger updates stock)
        const { data: movement, error: movementError } = await client
            .from('movements')
            .insert({
                product_id: product.id,
                type: scanDto.type,
                quantity: scanDto.quantity || 1,
                operator_id: scanDto.operator_id || null,
            })
            .select()
            .single();

        if (movementError) {
            throw new Error(`Failed to record movement: ${movementError.message}`);
        }

        return {
            message: `${scanDto.type} scan processed for ${product.name}`,
            movement,
        };
    }

    async createProduct(createProductDto: CreateProductDto) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('products')
            .insert(createProductDto)
            .select()
            .single();

        if (error) throw new Error(`Failed to create product: ${error.message}`);
        return data;
    }

    async getAllProducts(category?: string) {
        const client = this.supabaseService.getClient();
        let query = client.from('products').select('*');

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    }

    async getMovements() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('movements')
            .select('*, products(name)')
            .order('timestamp', { ascending: false })
            .limit(50);
        if (error) throw new Error(error.message);
        return data;
    }

    async getStats() {
        const client = this.supabaseService.getClient();

        // 1. Basic Counts
        const { count: totalProducts } = await client.from('products').select('*', { count: 'exact', head: true });
        const { count: criticalItemsCount } = await client.from('products').select('*', { count: 'exact', head: true }).filter('stock_actual', 'lte', 'stock_minimo');

        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: movements24h } = await client.from('movements').select('*', { count: 'exact', head: true }).gt('timestamp', last24h);

        // 2. Category Analysis
        const { data: categoryData } = await client.from('products').select('category, stock_actual');
        const categoriesMap: Record<string, number> = {};
        categoryData?.forEach(p => {
            categoriesMap[p.category] = (categoriesMap[p.category] || 0) + p.stock_actual;
        });

        const topCategories = Object.entries(categoriesMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        const activeCategories = Object.keys(categoriesMap).length;

        // 3. Movement Activity (Last 12 Hours)
        const last12h = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { data: recentMovements } = await client
            .from('movements')
            .select('timestamp')
            .gt('timestamp', last12h);

        const hourlyActivity = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(Date.now() - (11 - i) * 60 * 60 * 1000);
            const hour = date.getHours();
            const count = recentMovements?.filter(m => new Date(m.timestamp).getHours() === hour).length || 0;
            return { hour, count };
        });

        // 4. Critical Items List
        const { data: criticalList } = await client
            .from('products')
            .select('id, name, sku_qr, stock_actual, stock_minimo')
            .filter('stock_actual', 'lte', 'stock_minimo')
            .limit(5);

        // 5. Total Stock for Capacity
        const { data: allMovements } = await client.from('movements').select('type, quantity');
        const totalStock = allMovements?.reduce((acc, mv) => {
            return mv.type === 'IN' ? acc + mv.quantity : acc - mv.quantity;
        }, 0) || 0;

        return {
            totalProducts: totalProducts || 0,
            movements24h: movements24h || 0,
            criticalItems: criticalItemsCount || 0,
            storageCapacity: Math.min(100, Math.max(0, Math.floor((totalStock / 5000) * 100))),
            currentStock: totalStock,
            activeCategories,
            topCategories,
            hourlyActivity,
            criticalItemsList: criticalList || [],
            loadByZone: [
                { label: 'Cold Storage', usage: Math.floor(Math.random() * 20 + 70) + '%', status: 'Critical' },
                { label: 'General Racks', usage: Math.floor(Math.random() * 30 + 40) + '%', status: 'Optimal' },
                { label: 'Hazardous Materials', usage: Math.floor(Math.random() * 20 + 20) + '%', status: 'Optimal' },
            ]
        };
    }
}
