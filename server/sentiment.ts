import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHTROPIC_API_KEY,
})

type SentimentType = {
  emotion: 'happy' | 'sad' | 'angry' | 'excited',
  amount: number,
  characterStart: number,
  characterEnd: number
}

export const getSentiment = async (text: string):Promise<SentimentType[] | null> => { 
  const msg = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    temperature: 0,
    system: "You are a smart person with emotions. Given an input return a JSON ONLY like this:\n\n```\n[\n{\n  \"emotion\": \"happy\" | \"sad\" | \"angry\" | \"excited\"\n  \"amount\": 0.32,\n  \"characterStart\": 10,\n  \"characterEnd\": 21\n}\n]\n```\n\nIf you have multiple of the same emotions it should cover the whole string. If you had \"happy\" from 3 to 7 and \"happy\" from 8 to 15 then it should be \"happy\" from 3 to 15.\n\nONLY RETURN JSON. NOTHING ELSE!",
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": text
          }
        ]
      }
    ]
  })
  // @ts-ignore-next-line
  const raw = msg.content[0].text
  try {
    const json = JSON.parse(raw)
    return json
  } catch (e) {
    console.log('error parsing', e)
    return null
  }
}