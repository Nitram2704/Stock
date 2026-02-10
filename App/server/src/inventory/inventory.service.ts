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
}
