import { CreateUserDto } from './dto/create-user.dto.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository( User )
    private userRepository: Repository<User>
  ){}

  async login( data: UpdateUserDto ) {
    try{
      const user = await this.userRepository.findOneBy({ email: data.email });
      if(user?.password && data.password){
        return await bcrypt.compare(data.password, user.password) ? user : false;
      }else{
        return false;
      }
    }catch(error){
      return false;
    }
  }

  async create(data: CreateUserDto) {
    const saltOrRounds: number = 10;

    const hash: string = await bcrypt.hash(data.password, saltOrRounds);

    const new_data = { ...data, password: hash };

    const register = this.userRepository.create( new_data );

    return await this.userRepository.save(register);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id_user: number) {
    return await this.userRepository.findBy({ id_user });
  }

  async update(id_user: number, data: UpdateUserDto) {

    if(data.password){
      const saltOrRounds: number = 10;

      const hash: string = await bcrypt.hash(data.password, saltOrRounds);

      const new_data = { ...data, password: hash };

      return await this.userRepository.update(id_user, new_data);
    }

    return await this.userRepository.update(id_user, data);
  }

  async remove(id_user: number) {
    return await this.userRepository.delete({ id_user });
  }
}
