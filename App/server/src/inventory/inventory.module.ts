import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TelemetryService } from './telemetry.service';

@Module({
    controllers: [InventoryController],
    providers: [InventoryService, TelemetryService],
    exports: [InventoryService],
})
export class InventoryModule { }
