import Display from "../components/display";

export default async function PokemonPage({ params }: { params: { pokemon: string } }) {
  // Ensure params.pokemon is properly handled
  // const pokemonName = params.pokemon;
  
  return (
    <div>
      <Display pokemon={params.pokemon} />
    </div>
  );
} 
