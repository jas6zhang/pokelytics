export const dynamic = 'force-static' 

import OpenAI from "openai";

export async function POST(req) {
  const { prompt } = await req.json();
  console.log('prompt', prompt)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // under the hood makes fetch 
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    // "stream": true
   });
  
  // const res = await fetch('https://api.openai.com/v1/chat/completions', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //   },
  // })
  // const data = await res.json() // converts to object
  // // console.log(data)
  console.log('data', completion.choices[0].message?.content)
  return Response.json(completion.choices[0].message?.content)
  // console.log('data', Response.json(completion.choices[0].message))
  // return Response.json(completion.choices.message[0])
}
