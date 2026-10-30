import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto.js';
import { UpdateSensorDto } from './dto/update-sensor.dto.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './entities/sensor.entity.js';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository( Sensor, "mariadb-connection")
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

  async insertMasivo( lecturas: Partial<Sensor>[], tamanoLote=1000 ){
    for ( let i = 0; i < lecturas.length; i += tamanoLote ){
      await this.sensorRepository
        .createQueryBuilder()
        .insert()
        .into(Sensor)
        .values(lecturas.slice(i, i + tamanoLote))
        .execute();
    }
  }

  total() {
    // select count(*) from sensor;
    return this.sensorRepository.count();
  }

  async paginado( pagina: number = 1, limite: number = 50, baseUrl: string ) {
    /*
     (pagina 2)
      SELECT * FROM sensor
      ORDER BY id_sensor DESC
      LIMIT 50 OFFSET 50;
    */
    const data = await this.sensorRepository.find({
      order: { id_sensor: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    const pagina_next: number = pagina + 1;

    const next = `${baseUrl}?pagina=${+pagina_next}&limite=${limite}`;
    const prev = ( pagina - 1 == 0 ) ? null : `${baseUrl}?pagina=${+pagina_next}&limite=${limite}`;

    const author = "Author: Pandora Xdn"

    return {
      author,
      next,
      prev,
      data
    }
  }

}
