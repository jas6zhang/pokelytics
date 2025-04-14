'use client'

import { useEffect, useState } from 'react';
import _ from 'lodash';
import Image from "next/image"
import SearchInput from './search.js';
import { useParams } from 'next/navigation'
import { Textarea, Button, ButtonGroup, } from "@chakra-ui/react"
import { Clipboard, IconButton, Input, InputGroup } from "@chakra-ui/react"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Provider } from "@/components/ui/provider"

export default function Display({ pokemon }) {
  // const [data, setData] = useState(null); 
  const [titleCasePokemonName, setTitleCasePokemonName] = useState(null);
  const [inputSpecs, setInputSpecs] = useState("");
  // const [sprite, setSprite] = useState(null);
  const [basicData, setBasicData] = useState(null);
  const [competitiveData, setCompetitiveData] = useState(null);
  const [pokemonSet, setPokemonSet] = useState("");
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
  
  function generateSetsWithChatGPT(input) {
    const prompt = `Generate a competitive set for ${titleCasePokemonName} in Pokemon Scarlet and Violet. 
    Here are some user specifications: ${input}.
    Please generate it as copyable text that can be imported for Pokemon Showdown similar to:
    Iron Treads @ Booster Energy  
    Ability: Quark Drive  
    Tera Type: Ghost  
    EVs: 252 SpA / 4 SpD / 252 Spe  
    Timid Nature  
    - Stealth Rock  
    - Steel Beam  
    - Earth Power  
    - Rapid Spin
    Please also remove all text in your response not related to the import text.`;
    // add rate limiting here
    // logic for this should be on server side not client side
    // const url = 'https://api.openai.com/v1/chat/completions';
    
    fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
      .then(async (res) => {
      console.log("RETURNED", res)
      if (!res.ok) {
        throw new Error("Server error");
      }
      const json = await res.json(); // It reads the entire body stream of the HTTP response.
      console.log("RETURNED2", json)
        // const showdownText = json;
      // const showdownText = json.choices?.[0]?.message?.content;
      setPokemonSet(json);
    })
    
    // fetch('/api/gpt', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt }), // pass the prompt as expected by the server
    // })
    // .then((res) => res.json())
    // .then((json) => {
    //   console.log("GPT DATA", json);
    //   // setData(json);
    //   const processedData = processCompetitiveData(json);
    //   setCompetitiveData(processedData);
    // })
    // .catch((err) => {
    //   console.error("error fetching competitive api info: ", err);
    //   setError("failed to load Pokemon stats");
    // });

    
    // fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: [{ role: 'user', content: prompt }],
    //   }),
    // })
    // .then(response => response.json())
    // .then(data => console.log(data))
    // .then(setPokemonSet(data))
    // .catch(error => console.error('error fetching info from openai', error));
  }
  
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
  
  const ClipboardIconButton = () => {
    return (
      <Clipboard.Trigger asChild>
        <IconButton variant="surface" size="xs" me="-2">
          <Clipboard.Indicator />
        </IconButton>
      </Clipboard.Trigger>
    )
  }
    
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
  console.log("SPECS", inputSpecs)
  console.log(titleCasePokemonName)
  
  // first check for the conditionals and then use ? 
  return (
    <div> 
      <Provider>
      
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
          <Textarea value={inputSpecs} onChange={(e) => setInputSpecs(e.target.value)}  placeholder="Input Some Specifications For Set" />
            <Button onClick={() => generateSetsWithChatGPT(inputSpecs)} colorPalette="blue" variant="outline">Generate Pokemon Set</Button>
          <Textarea value ={pokemonSet} onChange={(e) => setPokemonSet(e.target.value)} placeholder="Generated Set" />
            <Clipboard.Root maxW="300px" value={pokemonSet}>
              <Clipboard.Label textStyle="label">{pokemonSet}</Clipboard.Label>
          <InputGroup endElement={<ClipboardIconButton />}>
            <Clipboard.Input asChild>
              <Input />
            </Clipboard.Input>
          </InputGroup>
        </Clipboard.Root>
          {/* <Textarea value={pokemonSet} onChange={(e) => setPokemonSet(e.target.value)}  placeholder="Generated Set" /> */}
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
        </Provider>
    </div>
  );
}

