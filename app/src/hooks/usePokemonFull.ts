import { useState, useEffect, use } from "react";
import { PokemonDetailResponse } from "../interfaces/pokemonReponse";
import { pandoraApi } from "../api/pandoraApi";

interface UsePokemonFull {
  isLoading: boolean;
  pokemonDetail: PokemonDetailResponse;
}

export const usePokemonFull = ( id: string | number ): UsePokemonFull => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ pokemonDetail, setPokemonDetail ] = useState<PokemonDetailResponse>({} as PokemonDetailResponse);

  const loadPokemon = async () => {
    setIsLoading(true);
    const response = await pandoraApi.get<PokemonDetailResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`)
    setPokemonDetail( response.data );
    setIsLoading(false);
  }

  useEffect(() => {
    loadPokemon();
  },[]);

  return  { isLoading, pokemonDetail };
}
