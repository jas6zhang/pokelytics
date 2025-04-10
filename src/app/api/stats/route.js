export const dynamic = 'force-static' 

// defines the handlers for the route to api
// don’t need to define any extra routes or middleware — the file system struct is the router.
export async function GET() {
  const res = await fetch('https://pkmn.github.io/smogon/data/stats/gen9ou.json', {
    headers: {
      'Content-Type': 'application/json',
      // 'API-Key': process.env.DATA_API_KEY,
    },
  })
  const sprite = await fetch('https://pokeapi.co/api/v2/pokemon/ditto/sprite', {
    headers: {
      'Content-Type': 'application/json',
      // 'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json() // converts to object
  // console.log(data)
  return Response.json({ data })
}
