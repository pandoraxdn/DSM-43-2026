export interface UserReponse {
  id_user:  number;
  username: string;
  email:    string;
  password: string;
  imagen:   string;
}

export type LoginReponse = UserReponse | false;
