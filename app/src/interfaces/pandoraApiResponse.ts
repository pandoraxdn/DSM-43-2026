export interface UserReponse {
  id_user:    number;
  username:   string;
  email:      string;
  password:   string;
  imagen:     string;
  location:   string;
  update:     Date;
}

export type LoginReponse = UserReponse | false;

export interface DataResponse {
  total:           number;
  diasFrios:       Dias[];
  diasCalurosos:   Dias[];
  topTemperaturas: Sensor[];
  estadisticas:    Estadisticas;
  ultimasHoras:    Sensor[];
  alertas:         Sensor[];
  hoy:             Sensor[];
  ayer:            Sensor[];
  anteayer:        Sensor[];
}

export interface Sensor {
  id_sensor:           number;
  fecha:               Date;
  distancia_cm:        number;
  distancia_inch:      number;
  temperatura_celcius: number;
  temperatura_f:       number;
}

export interface Dias {
    dia:      Date;
    promedio: number;
}

export interface Estadisticas {
    total:         string;
    temp_promedio: number;
    temp_maxima:   number;
    temp_minimo:   number;
    dist_promedio: number;
}
