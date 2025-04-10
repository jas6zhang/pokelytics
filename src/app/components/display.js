'use client'

import { useEffect, useState } from 'react';
import _ from 'lodash';
import Image from "next/image"
import SearchInput from './search.js';
import { useParams } from 'next/navigation'

export default function Display({ pokemon }) {
  const [data, setData] = useState(null); 
  const [sprite, setSprite] = useState(null);
  const [pokemonMap, setPokemonMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Fetch stats data
    fetch('/api/stats')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const processedData = processData(json);
        setPokemonMap(processedData);
      })
      .catch((err) => {
        console.error("error fetching api stats: ", err);
        setError("Failed to load Pokemon stats");
      });

    // Fetch sprite data if pokemon is provided
    if (pokemon) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`)
        .then((res) => res.json())
        .then((json) => {
          setSprite(json.sprites["front_default"]);
        })
        .catch((err) => {
          console.error("error fetching api pokemon: ", err);
          setError("Failed to load Pokemon sprite");
        });
    }
    
    setIsLoading(false);
  }, [pokemon]);

  function processData(data) {
    if (!data?.data?.pokemon) {
      return null;
    }
    
    const processedData = {};
    Object.entries(data.data.pokemon).forEach(([key, val]) => {
      processedData[key] = {
        name: key,
        usage: val.usage.raw * 100,
        abilities: val.abilities,
        moves: val.moves, 
        image: val.image
      };
    });
    return processedData;
  }

  if (error) {
    return (
      <div>
        <SearchInput defaultValue={pokemon} />
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <SearchInput defaultValue={pokemon} />
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div> 
      <SearchInput defaultValue={pokemon} />
      {pokemon && pokemonMap && pokemonMap[pokemon] ? (
        <div>
          <h1 className="text-2xl font-bold">{pokemonMap[pokemon].name}</h1>
          {sprite && <img src={sprite} width={200} height={200} alt={pokemon} className="mx-auto" />}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Usage Rate</h2>
            <p>{pokemonMap[pokemon].usage.toFixed(2)}%</p>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Abilities</h2>
            {Object.entries(pokemonMap[pokemon].abilities).map(([key, val]) => (
              <div key={key}>{key}</div>
            ))}
          </div>
        </div>
      ) : (
        <div>No data found for {pokemon}</div>
      )}
    </div>
  );
}

