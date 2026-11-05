import { useEffect, useState } from "react";
import { pandoraApi } from "../api/pandoraApi";
import { DataResponse } from "../interfaces/pandoraApiResponse";

export const useDataResponse = () => {

  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ data, setData ] = useState<DataResponse>();
  const urlApi = "http://10.172.189.74:3000/sensors/consultas/data"

  const loadData = async () => {
    setIsLoading(true);
    const response = await pandoraApi.get<DataResponse>(urlApi);
    setData( response.data );
    setIsLoading(false);
  }

  useEffect( () => {
    loadData();
  },[]);

  return { isLoading, data, loadData };

}







