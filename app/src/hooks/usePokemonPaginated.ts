import { useState, useRef, useEffect } from "react";
import { pandoraApi } from "../api/pandoraApi";
import { PokedexResponse, Result, NewPokemonList } from "../interfaces/pokemonReponse";

export const usePokemonPaginated = () => {

  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ simplePokemonList, setSimplePokemonList ] = useState<NewPokemonList[]>([]);
  const nextPageUrl = useRef<string|null>("https://pokeapi.co/api/v2/pokemon");

  const loadPokemons = async () => {
    setIsLoading(true);

    if(!nextPageUrl.current){
      setIsLoading(false);
      return;
    }

    const response = await pandoraApi.get<PokedexResponse>(nextPageUrl.current);

    mapPokemoList( response.data.results );
    nextPageUrl.current = response.data.next;

  }

  const mapPokemoList = (data: Result[]) => {
    // https://pokeapi.co/api/v2/pokemon/1/
    const list: NewPokemonList[] = data.map( ({ name, url }) => {

      const urlParts = url.split('/');
      //[https, pokeapi.co, api, v2, pokemon, 1, ""]
      const id = urlParts[ urlParts.length - 2 ];
      const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      return  {
        id,
        name,
        url,
        image
      }
    });

    setSimplePokemonList( (prevList) => [ ...prevList, ...list ] );

    setIsLoading(false);

  }

  useEffect(() => {
    loadPokemons();
  },[]);

  return { isLoading, loadPokemons, simplePokemonList };

}

