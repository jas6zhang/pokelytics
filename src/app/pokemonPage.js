import Display from '../../components/display';

export default function PokemonPage({ params }) {
  const pokemonName = params.pokemon.replace(/-/g, ' ');
  return <Display pokemon={pokemonName} />;
}
