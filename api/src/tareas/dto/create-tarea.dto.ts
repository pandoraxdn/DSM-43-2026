import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { EstadoTarea } from "../entities/tarea.entity.js";

export class CreateTareaDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsEnum( EstadoTarea )
  @IsOptional()
  estado: EstadoTarea;
}
