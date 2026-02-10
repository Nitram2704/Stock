import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    sku_qr: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    stock_actual?: number = 0;

    @IsOptional()
    @IsNumber()
    stock_minimo?: number = 5;

    @IsOptional()
    @IsString()
    unit?: string = 'pcs';
}
