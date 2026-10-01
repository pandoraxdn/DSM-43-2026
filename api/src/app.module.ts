import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Module } from '@nestjs/common';
import { Sensor } from './sensors/entities/sensor.entity.js';
import { SensorsModule } from './sensors/sensors.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'najimi',
      password: 'pass',
      database: 'dsm43',
      entities: [ Sensor ],
      synchronize: true,
      autoLoadEntities: true
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      username: 'najimi',
      password: 'pass',
      database: 'DSM43',
      entities: [ User ],
      synchronize: true,
      autoLoadEntities: true
    }),
    UsersModule,
    SensorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
