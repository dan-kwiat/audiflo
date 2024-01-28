# Audiflo

Demo here: [https://audiflo.vercel.app](https://audiflo.vercel.app)

Forked from https://github.com/ntegrals/voice-assistant-web

## Installation

1. Clone the repo

   ```sh
   git clone https://github.com/dan-kwiat/audiflo.git
   ```

2. Create env file and add your keys

   ```sh
   cp .env.example .env.local
   ```

3. Install the dependencies
   ```sh
   npm install
   ```
4. Run the app
   ```
   npm run dev
   ```

## How it works

1. Text is chunked into sentences and passed through Elevenlabs with custom
   voice
2. When the reader pauses to ask a question, Whisper convert's their audio to
   text
3. The text question then goes to GPT 3.5 along with the recently spoken part of
   the article for context
4. The response from GPT is the passed through Elevenlabs to be spoken back to
   the reader
