'use client'

import { useEffect, useState } from 'react';
import _ from 'lodash';
import Image from "next/image"
import SearchInput from './search.js';
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Display({ pokemon }) {
  // const [data, setData] = useState(null); 
  const [titleCasePokemonName, setTitleCasePokemonName] = useState(null);
  // const [sprite, setSprite] = useState(null);
  const [basicData, setBasicData] = useState(null);
  const [competitiveData, setCompetitiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // pokeAPI doesn't have bulk pokemon data
  // so we need to fetch the data for each pokemon
  
  // Using multiple useEffects with specific dependencies is the React - recommended pattern for managing ordered or logically grouped effects.
  // If there’s no dependency (i.e. the effects are completely independent), then React runs them in the order they’re declared—top to bottom—after the render is committed.
  
  useEffect(() => {
    setTitleCasePokemonName(pokemon ? _.startCase(_.toLower(pokemon)) : '');
  }, [pokemon]);

  useEffect(() => {
    setIsLoading(true); // part of next js? 
    setError(null);
    
    if (!titleCasePokemonName) return;
    // Fetch stats data ==> need to be async so then is loading can be done after
    const fetchData = async () => {
      try {
        fetch('/api/stats')
          .then((res) => res.json())
          .then((json) => {
            // setData(json);
            const processedData = processCompetitiveData(json);
            setCompetitiveData(processedData);
          })
          .catch((err) => {
            console.error("error fetching competitive api info: ", err);
            setError("failed to load Pokemon stats");
          });

        // Fetch sprite data if pokemon is provided
        if (pokemon) {
          const pokemonName = pokemon.toLowerCase().trim().replace(/\s+/g, '-')
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            .then((res) => res.json())
            .then((json) => {
              const processedData = processBasicData(json);
              setBasicData(processedData);
              // setSprite(json.sprites["front_default"]);
            })
        }
      } catch (err) {
        console.error("error fetching basic api info: ", err);
        setError("failed to load Pokemon stats");
      } finally {
        setIsLoading(false);
      }
  }; 
  fetchData();
    // setTitleCasePokemonName(_.startCase(_.toLower(pokemon)));
    // setIsLoading(false);
  }, [titleCasePokemonName]);
  
  function processBasicData(data) {
    if (!data) {
      return null;
    }
    const processedData = {};
    // . access keys, [] access the key's map

    processedData[titleCasePokemonName] = {
      // map the types into the map
      types: data.types,
      // types: data.types.map(t => t.type.name),
      sprite: data.sprites["front_default"],
      stats: data.stats.map(stat => ({
        name: stat.stat.name.toUpperCase(),
        value: stat.base_stat,
      })),
      // abilities: val.abilities,
      // moves: val.moves,
      // image: val.image
    }
    console.log(processedData[titleCasePokemonName]);

    return processedData;
  }
  
  function processCompetitiveData(data) {
    if (!data?.data?.pokemon) {
      return null;
    }
    
    const processedData = {};
    
    // object keys are ordered in js
    Object.entries(data.data.pokemon).forEach(([key, val]) => {
      processedData[key] = {
        name: key,
        usage: val.usage.raw,
        abilities: val.abilities,
        moves: Object.entries(val.moves).slice(0, 15),
        teammates: Object.entries(val.teammates).slice(0, 15),
        counters: Object.entries(val.counters).slice(0, 15),
      };
      console.log(processedData);
    })
    return processedData;
  };
  
  // check for errors
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
  console.log("COMPETITIVE", competitiveData)
  console.log("BASIC", basicData)
  // console.log(competitiveData[titleCasePokemonName].moves)
  // console.log(competitiveData[titleCasePokemonName].teammates)
  
  console.log(titleCasePokemonName)
  
  // first check for the conditionals and then use ? 
  return (
    <div> 
      
      <SearchInput defaultValue={pokemon} />
      {/* data format: [{ name: 'a', value: 12 }] */}
      
      {basicData && basicData[titleCasePokemonName] && competitiveData && competitiveData[titleCasePokemonName] ? (
        <div>
          <h1 className="text-2xl font-bold">{competitiveData[titleCasePokemonName].name}</h1>
          <img src={basicData[titleCasePokemonName].sprite} width={200} height={200} alt={titleCasePokemonName} className="mx-auto" />
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Usage Rate</h2>
            <p>{competitiveData[titleCasePokemonName].usage.toFixed(2) * 100}%</p>
          </div>
          <ResponsiveContainer width="50%" height={300}>
            <BarChart layout="vertical" data={basicData[titleCasePokemonName].stats}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              {/* <Tooltip /> */}
              <Bar dataKey="value" fill="#8884d8" activeBar={{ stroke: 'red', strokeWidth: 2 }} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Abilities</h2>
            
            {/* Object.entries() turns an object into an array of [key, value] pairs */} 
            {/* in js, arrays can be mixed types! */}
            {Object.entries(competitiveData[titleCasePokemonName].abilities).map(([key, val]) => (
              <div key={key}>{key}: {val.toFixed(2) * 100}%</div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Moves</h2>
            {competitiveData[titleCasePokemonName].moves.map(([key, val]) => (
              <div key={key} className="flex justify-between border-b py-1">
                <span>{key}: {val.toFixed(2) * 100}%</span>
                {/* <span className="text-sm text-gray-500">{(freq * 100).toFixed(2)}%</span> */}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Teammates</h2>
            {competitiveData[titleCasePokemonName].teammates.map(([key, val]) => (
              <div key={key} className="flex justify-between border-b py-1">
                  <span>{key}: {val.toFixed(2) * 100}%</span>
              {/* <span className="text-sm text-gray-500">{(freq * 100).toFixed(2)}%</span> */}
              </div>
            ))}
          </div>
          {/* <div className="mt-4">
            <h2 className="text-xl font-semibold">Counters</h2>
            {Object.entries(competitiveData[titleCasePokemonName].counters).map(([key, val]) => (
              <div key={key}>{val}</div>
            ))}
          </div> */}
            <div className="mt-4">
            <h2 className="text-xl font-semibold">Type</h2>
            {basicData[titleCasePokemonName].types.map((t, idx) => (
                <div key={idx}>{t.type.name}</div>
              ))}
          </div>
        </div>
      ) : (
        <div>No data found for {pokemon}</div>
      )}
    </div>
  );
}

