import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateSensorDto { 
  @IsNotEmpty()
  @IsDateString()
  fecha?: Date;

  @IsNotEmpty()
  @IsNumber()
  distancia_cm: number;

  @IsNotEmpty()
  @IsNumber()
  distancia_inch: number;
}
