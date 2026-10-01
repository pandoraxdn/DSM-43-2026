import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  login(@Body( new ValidationPipe() ) updateUserDto: UpdateUserDto) {
    return this.usersService.login(updateUserDto);
  }

  @Post()
  create(@Body( new ValidationPipe() ) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id_user')
  findOne(@Param('id_user') id_user: number) {
    return this.usersService.findOne(id_user);
  }

  @Patch(':id_user')
  update(@Param('id_user') id_user: number, @Body( new ValidationPipe() ) updateUserDto: UpdateUserDto) {
    return this.usersService.update(id_user, updateUserDto);
  }

  @Delete(':id_user')
  remove(@Param('id_user') id_user: number) {
    return this.usersService.remove(id_user);
  }
}
