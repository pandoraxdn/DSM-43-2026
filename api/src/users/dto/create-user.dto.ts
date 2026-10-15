import { IsString, MinLength, MaxLength, IsEmail, IsDateString, IsOptional } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @MaxLength(255)
  @MinLength(5)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(255)
  @MinLength(5)
  password: string;

  @IsString()
  @MaxLength(255)
  @MinLength(5)
  location: string;

  @IsString()
  imagen: string;

  @IsDateString()
  @IsOptional()
  update: Date;
}
