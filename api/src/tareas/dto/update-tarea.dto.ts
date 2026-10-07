import { PartialType } from '@nestjs/mapped-types';
import { CreateTareaDto } from './create-tarea.dto.js';

export class UpdateTareaDto extends PartialType(CreateTareaDto) {}
