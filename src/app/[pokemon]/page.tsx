import Display from "../components/display";
// In Next.js (App Router), folders with square brackets [] are used for dynamic routes.
export default async function PokemonPage(props: { params: Promise<{ pokemon: string }> }) {
  const params = await props.params;
  
  // Convert hyphenated Pokemon name back to a format the API can use
  // For example, "mr-mime" should be "mr. mime" for the API
  const pokemonName = params.pokemon.replace(/-/g, ' ');
  
  return (
    <div>
      <Display pokemon={pokemonName} />
    </div>
  );
} 
