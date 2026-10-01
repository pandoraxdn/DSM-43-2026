import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorDto } from './create-sensor.dto.js';

export class UpdateSensorDto extends PartialType(CreateSensorDto) {}
