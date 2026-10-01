import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sensor {
  @PrimaryGeneratedColumn()
  id_sensor: number;

  @Column()
  fecha?: Date;

  @Column({ type: 'float', nullable: false })
  distancia_cm: number;

  @Column({ type: 'float', nullable: false })
  distancia_inch: number;
}
