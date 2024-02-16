interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface TextToSpeechData {
  text: string;
  model_id: string;
  voice_settings: VoiceSettings;
}

const CHUNK_SIZE = 1024;
// const voiceId = "5Q0t7uMcjvnagumLfvZi"; //generic middle aged man
// const voiceId = "P25p1uquqiW4omiQ3iXp" //paul graham
// const voiceId = "Zqg28U3xGcpMyoRq8PtN" // flo
const voiceId = "onwK4e9ZLuTAKqWW03F9"; // Daniel from Eleven Labs presets - https://api.elevenlabs.io/v1/voices

const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=4`;
const headers: Record<string, string> = {
  Accept: "audio/mpeg",
  "Content-Type": "application/json",
  "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
};

export const playAudio = async (
  input: string,
  onEnd: () => void
): Promise<void> => {
  const data: TextToSpeechData = {
    text: input,
    model_id: "eleven_turbo_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error("Network response was not ok.");
    }

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();

    const audioBuffer = await response.arrayBuffer();
    const audioBufferDuration = audioBuffer.byteLength / CHUNK_SIZE;

    audioContext.decodeAudioData(audioBuffer, (buffer) => {
      source.buffer = buffer;
      source.playbackRate.value = 1;

      source.connect(audioContext.destination);
      source.start();
    });

    source.onended = () => {
      source.stop();
      audioContext.close();
      onEnd();
    };

    // setTimeout(() => {
    //   source.stop()
    //   audioContext.close()
    //   onEnd()
    // }, audioBufferDuration * 1000)
  } catch (error) {
    console.error("Error:", error);
    onEnd();
  }
};
