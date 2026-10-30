import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { SensorsService } from './sensors.service.js';
import { CreateSensorDto } from './dto/create-sensor.dto.js';
import { UpdateSensorDto } from './dto/update-sensor.dto.js';
import { Sensor } from './entities/sensor.entity.js';
import * as express from 'express';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Post()
  create(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorsService.create(createSensorDto);
  }

  @Get()
  findAll() {
    // SELECT * FROM sensor;
    // 3,000,000
    return this.sensorsService.findAll();
  }

  @Get(':id_sensor')
  findOne(@Param('id_sensor') id_sensor: number) {
    return this.sensorsService.findOne(id_sensor);
  }

  @Patch(':id_sensor')
  update(@Param('id_sensor') id_sensor: number, @Body() updateSensorDto: UpdateSensorDto) {
    return this.sensorsService.update(id_sensor, updateSensorDto);
  }

  @Delete(':id_sensor')
  remove(@Param('id_sensor') id_sensor: number) {
    return this.sensorsService.remove(id_sensor);
  }

  @Get('consultas/total')
  total() {
    return this.sensorsService.total();
  }

  @Post('consultas/insertar-masivo')
  async insertMasivo( @Body() lecturas: Sensor[] ){
    await this.sensorsService.insertMasivo(
      lecturas.map( (l) => ({ ...l, fecha: l.fecha ? new Date(l.fecha) : undefined })  )
    );

    return { datos_ingresados: lecturas.length };
  }


  @Get('consultas/paginado')
  paginado( @Query('pagina') pagina = 1, @Query('limite') limite = 50, @Req() request: express.Request ) {
    const baseUrl: string = `${request.protocol}://${request.host}${request.baseUrl}/sensors/consultas/paginado`;
    return this.sensorsService.paginado( pagina, limite, baseUrl );
  }

}
