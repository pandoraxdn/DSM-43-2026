import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text' })
  imagen: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update: Date;
}




