require("dotenv").config({ path: ".env.local" })
import fs from "fs"
import { chunks } from "../src/app/chunks-pg"
// interface VoiceSettings {
//   stability: number
//   similarity_boost: number
// }

// interface TextToSpeechData {
//   text: string
//   model_id: string
//   voice_settings: VoiceSettings
// }

const CHUNK_SIZE = 1024
const voiceId = "eXveFzitr3hBwS16SAe9"
const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`
const headers = {
  Accept: "audio/mpeg",
  "Content-Type": "application/json",
  "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
}

async function persistAudio(id: string, text: string) {
  const data = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Network response was not ok.")
    }

    // write audio response to file with fs
    if (!response.body) {
      throw new Error("No response body.")
    }
    const reader = response.body.getReader()
    const writer = fs.createWriteStream(`./data/pg/audio-${id}.mp3`)

    let receivedLength = 0
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      chunks.push(value)
      receivedLength += value.length
    }

    const chunksAll = new Uint8Array(receivedLength)
    let position = 0
    for (let chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }

    writer.write(chunksAll)
  } catch (error) {
    console.error("Error:", error)
  }
}

async function main() {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    await persistAudio(i.toString(), chunk)
  }
}

main()

export {}
