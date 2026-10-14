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
