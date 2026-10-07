import { Module } from '@nestjs/common';
import { TareasService } from './tareas.service.js';
import { TareasController } from './tareas.controller.js';
import { Tarea } from './entities/tarea.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarea
    ], "mssql-connection")
  ],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}
