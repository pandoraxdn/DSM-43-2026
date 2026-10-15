import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Module } from '@nestjs/common';
import { Sensor } from './sensors/entities/sensor.entity.js';
import { SensorsModule } from './sensors/sensors.module.js';
import { Tarea } from './tareas/entities/tarea.entity.js';
import { TareasModule } from './tareas/tareas.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'mssql-connection',
      type: 'mssql',
      host: 'localhost',
      username: 'sa',
      password: 'P@ndoraxdn1',
      database: 'dsm43',
      port: 1433,
      entities: [ Tarea ],
      synchronize: true,
      autoLoadEntities: true,
      options: {
        trustServerCertificate: true
      }
    }),
    TypeOrmModule.forRoot({
      name: 'mariadb-connection',
      type: 'mariadb',
      host: 'localhost',
      username: 'najimi',
      password: 'pass',
      port: 3306,
      database: 'DSM43',
      entities: [ Sensor ],
      synchronize: true,
      autoLoadEntities: true
    }),
    TypeOrmModule.forRoot({
      name: 'postgres-connection',
      type: 'postgres',
      host: 'localhost',
      username: 'najimi',
      password: 'pass',
      database: 'dsm43',
      port: 5432,
      entities: [ User ],
      synchronize: true,
      autoLoadEntities: true
    }),
    UsersModule,
    SensorsModule,
    TareasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
