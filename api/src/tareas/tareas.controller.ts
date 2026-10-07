import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { TareasService } from './tareas.service.js';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  create(@Body( new ValidationPipe() ) createTareaDto: CreateTareaDto) {
    return this.tareasService.create(createTareaDto);
  }

  @Get()
  findAll() {
    return this.tareasService.findAll();
  }

  @Get(':id_tarea')
  findOne(@Param('id_tarea') id_tarea: number) {
    return this.tareasService.findOne( id_tarea );
  }

  @Patch(':id_tarea')
  update(@Param('id_tarea') id_tarea: number, @Body( new ValidationPipe() ) updateTareaDto: UpdateTareaDto) {
    return this.tareasService.update( id_tarea, updateTareaDto);
  }

  @Delete(':id_tarea')
  remove(@Param('id_tarea') id_tarea: number) {
    return this.tareasService.remove(id_tarea);
  }
}
