'use client'
 
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // go to another route
import { useSearchParams } from 'next/navigation'; // get search params
// import { useState } from 'react'
// avoid having to setup express for middleware  
 
// need to set up routes for each pokemon
export default function SearchInput({ defaultValue }) {
  const router = useRouter()
  
  const [inputValue, setInputValue] = useState(defaultValue)
  const handleChange = (event) => {
    setInputValue(event.target.value)
  }
  
  const handleSearch = () => {
    if (!inputValue) {
      return router.push('/')
    }
    // Replace spaces with hyphens and convert to lowercase
    const pokemonName = inputValue.toLowerCase().trim().replace(/\s+/g, '-')
    router.push(`/${pokemonName}`)
  }
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }
  
  return (
    <div className="border-[2px] border-solid border-slate-500 flex flex-row items-center gap-5 p-1 rounded-[15px]">
      <input
        className="bg-[transparent] outline-none border-none w-full py-3 pl-2 pr-3"
        type="text"
        placeholder="Search for a Pokemon"
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  )
};
