'use client'
import { useEffect, useState } from 'react';
import _ from 'lodash';


export default function Display(props) {
  console.log('Display component mounted')

  const [data, setData] = useState(null); 
  const [pokemonMap, setPokemonMap] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((json) => {
        setData(json)
      })
      .catch((err) => console.error("error fetching api stats: ", err))
  }, [])
  
  useEffect(() => {
    if (data) {
      const pokemonMap = processData(data);
      setPokemonMap(pokemonMap);
    }
  }, [data]);
  
  function processData(data) {
    if (!data?.data?.pokemon) {
      return null;
    }
    
    const processedData = {};
    Object.entries(data.data.pokemon).forEach(([key, val]) => {
      processedData[key] = {
        name: key,
        usage: val.usage.raw,
        abilities: val.abilities,
        moves: val.moves
      };
    });
    console.log("pokemonMap keys:", Object.keys(processedData));
    
    return processedData;
  }


  return (
    <div> 
      <ul> 
        {data && Object.entries(data.data).map(([key, val]) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
      <h1>{props.pokemon && pokemonMap && pokemonMap[props.pokemon]?.name}</h1>
      {props.pokemon && pokemonMap && Object.entries(pokemonMap[props.pokemon]?.abilities).map(([key, val]) => (
        <h2>{key}</h2>
      ))}
      {/* <h1>{props.pokemon && pokemonMap && pokemonMap[props.pokemon]?.abilities}</h1> */}
      {/* <h1>{pokemonMap[props.pokemon]}</h1> */}
    </div>
  )
}
