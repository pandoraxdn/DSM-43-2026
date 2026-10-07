import { Injectable } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';
import { Tarea } from './entities/tarea.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TareasService {

  constructor(
    @InjectRepository( Tarea, "mssql-connection" )
    private tareaRepository: Repository<Tarea>
  ){}

  async create(data: CreateTareaDto) {
    const register = this.tareaRepository.create( data );
    return await this.tareaRepository.save( register );
  }

  async findAll() {
    return await this.tareaRepository.find();
  }

  async findOne(id_tarea: number) {
    return await this.tareaRepository.findBy({ id_tarea });
  }

  async update(id_tarea: number, data: UpdateTareaDto) {
    return await this.tareaRepository.update( id_tarea, data );
  }

  async remove(id_tarea: number) {
    return await this.tareaRepository.delete(id_tarea);
  }
}
