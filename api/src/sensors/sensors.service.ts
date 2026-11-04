import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto.js';
import { UpdateSensorDto } from './dto/update-sensor.dto.js';
import { Repository, Between, MoreThan, MoreThanOrEqual } from 'typeorm';
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

  async total() {
    // select count(*) from sensor;
    return await this.sensorRepository.count();
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

  private async consultarDia( diasAtras: number ){
    /*
    SELECT * FROM sensor
    WHERE fecha BETWEEN '2026-11-04 00:00:00' AND '2026-11-04 23:59:59'
    ORDER BY fecha DESC
    LIMIT 10;
     * */
    const inicio = new Date();
    inicio.setDate( inicio.getDate() - diasAtras);
    inicio.setHours(0,0,0,0);

    const fin = new Date();
    fin.setDate( fin.getDate() - diasAtras);
    fin.setHours(23,59,59,999);

    return await this.sensorRepository.find({
      where: { fecha: Between(inicio, fin) },
      order: { id_sensor: 'DESC' },
      take: 10
    });
  }

  private async alertas(){
    /*
    SELECT * FROM sensor
    WHERE temperatura_celcius > 35
    LIMIT 10;
     * */
    return await this.sensorRepository.find({
      where: { temperatura_celcius:  MoreThan(35) },
      take: 10
    });
  }

  private async ultimasHoras( horas: number ){
    /*
    SELECT * FROM sensor
    WHERE fecha >= NOW() - INTERVAL 6 HOURS
    ORDER BY fecha DESC
    LIMIT 10;
     * */
    const desde = new Date( Date.now() - horas * 60 * 60 * 1000 );
    return await this.sensorRepository.find({
      where: { fecha:  MoreThanOrEqual(desde) },
      order: { fecha: 'DESC'},
      take: 10
    });
  }

  private async estadisticas(){
    /*
    SELECT
      COUNT(*) as total
      AVG(temperatura_celcius) as temp_promedio
      MAX(temperatura_celcius) as temp_maxima
      MIN(temperatura_celcius) as temp_minimo
      AVG(distancia_cm) as dist_promedio
    FROM sensor;
     * */
    return await this.sensorRepository
      .createQueryBuilder('s')
      .select('COUNT(*)','total')
      .addSelect('AVG(s.temperatura_celcius)','temp_promedio')
      .addSelect('MAX(s.temperatura_celcius)','temp_maxima')
      .addSelect('MIN(s.temperatura_celcius)','temp_minimo')
      .addSelect('AVG(s.distancia_cm)','dist_promedio')
      .getRawOne();
  }

  private async topTemperaturas(){
    /*
    SELECT * FROM sensor
    ORDER BY temperatura_celcius DESC
    LIMIT 10;
     * */
    return await this.sensorRepository
      .createQueryBuilder('s')
      .orderBy('s.temperatura_celcius', 'DESC')
      .limit(10)
      .getMany();
  }

  private async diasFrios(){
  /*
    SELECT
      DATE(fecha) as dia
      AVG(temperatura_celcius) as promedio
    FROM sensor
    GROUP BY dia
    HAVING AVG(temperatura_celcius) < 20
    ORDER BY dia DESC;
   * */
    return await this.sensorRepository
      .createQueryBuilder('s')
      .select("DATE(fecha)",'dia')
      .addSelect("AVG(s.temperatura_celcius)",'promedio')
      .groupBy('dia')
      .having('AVG(s.temperatura_celcius) < :max',{ max: 20 })
      .orderBy('promedio','DESC')
      .addOrderBy('dia','DESC')
      .limit(10)
      .getRawMany();
  }

  private async diasCalurosos(){
  /*
    SELECT
      DATE(fecha) as dia
      AVG(temperatura_celcius) as promedio
    FROM sensor
    GROUP BY dia
    HAVING AVG(temperatura_celcius) > 30
    ORDER BY dia DESC;
   * */
    return await this.sensorRepository
      .createQueryBuilder('s')
      .select("DATE(fecha)",'dia')
      .addSelect("AVG(s.temperatura_celcius)",'promedio')
      .groupBy('dia')
      .having('AVG(s.temperatura_celcius) > :min',{ min: 20 })
      .orderBy('promedio','DESC')
      .addOrderBy('dia','DESC')
      .limit(10)
      .getRawMany();
  }

  async data(){
    const total = await this.total();
    const diasFrios = await this.diasFrios();
    const diasCalurosos = await this.diasCalurosos();
    const topTemperaturas = await this.topTemperaturas();
    const estadisticas = await this.estadisticas();
    const ultimasHoras = await this.ultimasHoras(6);
    const alertas = await this.alertas();
    const hoy = await this.consultarDia(0);
    const ayer = await this.consultarDia(1);
    const anteayer = await this.consultarDia(2);
    return {
      total,
      diasFrios,
      diasCalurosos,
      topTemperaturas,
      estadisticas,
      ultimasHoras,
      alertas,
      hoy,
      ayer,
      anteayer
    }
  }

}
