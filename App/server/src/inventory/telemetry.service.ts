import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InventoryService } from './inventory.service';

@Injectable()
export class TelemetryService implements OnModuleInit {
    private readonly logger = new Logger(TelemetryService.name);
    private readonly products = [
        { sku_qr: 'SKU-PH001', name: 'Neural Link X1', category: 'Smartphones', stock_actual: 50, stock_minimo: 10 },
        { sku_qr: 'SKU-PH002', name: 'Quantum Core XS', category: 'Smartphones', stock_actual: 30, stock_minimo: 5 },
        { sku_qr: 'SKU-LT001', name: 'AeroShell Pro', category: 'Laptops', stock_actual: 20, stock_minimo: 3 },
        { sku_qr: 'SKU-LT002', name: 'VoidPad Carbon', category: 'Laptops', stock_actual: 15, stock_minimo: 5 },
        { sku_qr: 'SKU-AC001', name: 'Haptic Glove G1', category: 'Accessories', stock_actual: 100, stock_minimo: 20 },
        { sku_qr: 'SKU-AC002', name: 'Neural Audio Buds', category: 'Accessories', stock_actual: 80, stock_minimo: 15 },
    ];

    constructor(
        private supabaseService: SupabaseService,
        private inventoryService: InventoryService,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing Neural Telemetry Grid...');
        await this.seedProducts();
        this.startTelemetryLoop();
    }

    private async seedProducts() {
        const client = this.supabaseService.getClient();
        if (!client) return;

        const { count, error } = await client
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (error) {
            this.logger.error(`Failed to check products: ${error.message}`);
            return;
        }

        if (count === 0) {
            this.logger.log('Neural Grid empty. Injecting synthetic product catalog...');
            const { error: insertError } = await client.from('products').insert(this.products);
            if (insertError) {
                this.logger.error(`Failed to seed products: ${insertError.message}`);
            } else {
                this.logger.log('Synthetic catalog successfully synchronized.');
            }
        }
    }

    private startTelemetryLoop() {
        // Run simulation every 30 seconds
        setInterval(() => this.simulateMovement(), 30000);
        this.logger.log('Autonomous Telemetry Loop active [Interval: 30s]');
    }

    private async simulateMovement() {
        const now = new Date();
        const hour = now.getHours();

        // Peak Hour Logic (8-10 AM and 4-6 PM)
        const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 18);

        // Probability of movement
        // 80% chance during peak hours, 20% otherwise
        const probability = isPeakHour ? 0.8 : 0.2;

        if (Math.random() > probability) return;

        const client = this.supabaseService.getClient();
        const { data: dbProducts } = await client.from('products').select('sku_qr');

        if (!dbProducts || dbProducts.length === 0) return;

        const randomProduct = dbProducts[Math.floor(Math.random() * dbProducts.length)];
        const types: ('IN' | 'OUT')[] = ['IN', 'OUT'];
        const type = types[Math.floor(Math.random() * types.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        try {
            await this.inventoryService.processScan({
                sku_qr: randomProduct.sku_qr,
                type,
                quantity,
                operator_id: undefined,
            });
            this.logger.log(`[Telemetry] Autonomous ${type} movement recorded for ${randomProduct.sku_qr} (Qty: ${quantity})`);
        } catch (error) {
            this.logger.error(`[Telemetry] Failed simulation: ${error.message}`);
        }
    }
}
