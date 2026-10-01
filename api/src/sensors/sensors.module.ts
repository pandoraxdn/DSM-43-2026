import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service.js';
import { SensorsController } from './sensors.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './entities/sensor.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sensor
    ])
  ],
  controllers: [SensorsController],
  providers: [SensorsService],
})
export class SensorsModule {}
