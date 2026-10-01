import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto.js';
import { UpdateSensorDto } from './dto/update-sensor.dto.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './entities/sensor.entity.js';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository( Sensor )
    private sensorRepository: Repository<Sensor>
  ){}

  async create( data: CreateSensorDto) {
    const register = this.sensorRepository.create(data);
    return await this.sensorRepository.save(register);
  }

  async findAll() {
    return await this.sensorRepository.find();
  }

  async findOne(id_sensor: number) {
    return await this.sensorRepository.findBy({ id_sensor });
  }

  async update(id_sensor: number, data: UpdateSensorDto) {
    return await this.sensorRepository.update(id_sensor, data);
  }

  async remove(id_sensor: number) {
    return await this.sensorRepository.delete(id_sensor);
  }
}
