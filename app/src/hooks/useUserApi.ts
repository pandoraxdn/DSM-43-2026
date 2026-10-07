import { useEffect, useState } from "react";
import { pandoraApi } from "../api/pandoraApi";
import { UserReponse } from "../interfaces/pandoraApiResponse";
import { FormUserData } from "./useUserForm";

interface UseUserApi{
  isLoading:  boolean;
  listUser:   UserReponse[];
  loadUsers:  () => void;
  createUser: (data: FormUserData) => void;
  updateUser: (data: FormUserData) => void;
  deleteUser: (data: FormUserData) => void;
}

export const useUserApi = (): UseUserApi => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ listUser, setListUser ] = useState<UserReponse[]>([]);
  const urlApi = "http://10.172.189.74:3000/users"

  const loadUsers = async () => {
    setIsLoading(true);
    const response = await pandoraApi.get<UserReponse[]>(urlApi);
    setListUser( response.data );
    setIsLoading(false);
  }

  useEffect( () => {
    loadUsers();
  },[]);

  const createUser = async ( data: FormUserData ) => {
    const dataBody = {
      username: data.username,
      password: data.password,
      email: data.email,
      image: data.imagen
    }

    await pandoraApi.post( urlApi, dataBody );
  }

  const updateUser = async ( data: FormUserData ) => {
    const dataBody = {
      username: data.username,
      password: data.password,
      email: data.email,
      image: data.imagen
    }

    await pandoraApi.post( `${urlApi}/${data.id_user}`, dataBody );
  }

  const deleteUser = async ( data: FormUserData ) => {
    await pandoraApi.delete(`${urlApi}/${data.id_user}`);
  }

  return { isLoading, listUser, loadUsers, createUser, updateUser, deleteUser };

}
