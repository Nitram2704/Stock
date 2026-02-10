import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ScanDto } from './dto/scan.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('api/v1/inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('scan')
    @UsePipes(new ValidationPipe({ transform: true }))
    async processScan(@Body() scanDto: ScanDto) {
        return this.inventoryService.processScan(scanDto);
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createProduct(@Body() createProductDto: CreateProductDto) {
        return this.inventoryService.createProduct(createProductDto);
    }

    @Get()
    async getAllProducts(@Query('category') category?: string) {
        return this.inventoryService.getAllProducts(category);
    }

    @Get('movements')
    async getMovements() {
        return this.inventoryService.getMovements();
    }
}
