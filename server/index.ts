import fs from 'node:fs'
const log = fs.readFileSync('./log/log.txt', 'utf-8')


import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY
})

import { getSentiment } from './sentiment'

Bun.serve({
  port: 3000,
  async fetch(req, server) {

    if (server.upgrade(req)) {
      return
    }

    if (req.url === '/add') {
      console.log('add', req.method, req.body)
    }

    return new Response("All good", { status: 200 })
  },
  websocket: {
    async message(ws, message) { 
      if (Buffer.isBuffer(message)) { 
        console.log('buffer')
        const fileName = `./wav/${Date.now()}.wav`
        fs.writeFileSync(fileName, message)
        const stream = fs.createReadStream(fileName)
        try {
          const transcription = await openai.audio.transcriptions.create({
            file: stream,
            model: "whisper-1",
          })
          console.log('transcription',transcription.text)
          let sentiment:any = null
          try {
            sentiment = await getSentiment(transcription.text)
            console.log('sentiment', sentiment)
          } catch (e) {
            console.log('error getting sentiment')
          }
          ws.send(JSON.stringify({
            type: 'transcription',
            text: transcription.text,
            sentiment: sentiment
          }))
        } catch (_) {
          console.log('error transcribing')
          // console.log(e)
        }
        return
      }
      console.log('message', message)

    }, // a message is received
    open(ws) {
      console.log('open')
      ws.send('hello again')
    },
    close(ws, code, message) {
      console.log('close', message)
    },
    drain(ws) {
      console.log('drain')
    },
  },
})