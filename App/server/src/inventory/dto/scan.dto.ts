import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class ScanDto {
    @IsNotEmpty()
    @IsString()
    sku_qr: string;

    @IsNotEmpty()
    @IsEnum(['IN', 'OUT'])
    type: 'IN' | 'OUT';

    @IsOptional()
    @IsNumber()
    quantity?: number = 1;

    @IsOptional()
    @IsString()
    operator_id?: string;
}
