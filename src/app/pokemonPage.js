import Display from '../../components/display';

export default function PokemonPage({ params }) {
  const { pokemon } = params;
  return <Display pokemon={pokemon} />;
}
