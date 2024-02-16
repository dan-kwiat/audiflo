"use client"
import React, { useState, useEffect, useRef, ChangeEvent } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

interface VoiceSettings {
  stability: number
  similarity_boost: number
}

interface TextToSpeechData {
  text: string
  model_id: string
  voice_settings: VoiceSettings
}

const AssistantButton: React.FC = () => {
  const [mediaRecorderInitialized, setMediaRecorderInitialized] =
    useState<boolean>(false)
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [recording, setRecording] = useState<boolean>(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  let chunks: BlobPart[] = []

  useEffect(() => {
    if (mediaRecorder && mediaRecorderInitialized) {
      // Additional setup if needed
    }
  }, [mediaRecorder, mediaRecorderInitialized])

  const playAudio = async (input: string): Promise<void> => {
    console.log("playAudio", input)
    const CHUNK_SIZE = 1024
    // const voiceId = "eXveFzitr3hBwS16SAe9" //generic middle aged man
    // const voiceId = "P25p1uquqiW4omiQ3iXp" //paul graham
    // const voiceId = "Zqg28U3xGcpMyoRq8PtN" // flo
    const voiceId = "onwK4e9ZLuTAKqWW03F9"; // Daniel from Eleven Labs presets - https://api.elevenlabs.io/v1/voices

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`
    const headers: Record<string, string> = {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
    }
    const data: TextToSpeechData = {
      text: input,
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

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const source = audioContext.createBufferSource()

      const audioBuffer = await response.arrayBuffer()
      const audioBufferDuration = audioBuffer.byteLength / CHUNK_SIZE

      audioContext.decodeAudioData(audioBuffer, (buffer) => {
        source.buffer = buffer
        source.playbackRate.value = 1

        source.connect(audioContext.destination)
        source.start()
      })

      setTimeout(() => {
        source.stop()
        audioContext.close()
        setAudioPlaying(false)
      }, audioBufferDuration * 1000)
    } catch (error) {
      console.error("Error:", error)
      setAudioPlaying(false)
    }
  }

  const handlePlayButtonClick = (input: string): void => {
    setAudioPlaying(true)
    playAudio(input)
  }

  const startRecording = (): void => {
    if (mediaRecorder && mediaRecorderInitialized) {
      mediaRecorder.start()
      setRecording(true)
    }
  }

  const stopRecording = (): void => {
    toast("Thinking", {
      duration: 5000,
      icon: "💭",
      style: {
        borderRadius: "10px",
        background: "#1E1E1E",
        color: "#F9F9F9",
        border: "0.5px solid #3B3C3F",
        fontSize: "14px",
      },
      position: "top-right",
    })
    if (mediaRecorder) {
      mediaRecorder.stop()
      setRecording(false)
    }
  }

  return (
    <div>
      <motion.div
        onClick={() => {
          if (typeof window !== "undefined" && !mediaRecorderInitialized) {
            setMediaRecorderInitialized(true)

            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                const newMediaRecorder = new MediaRecorder(stream)

                newMediaRecorder.onstart = () => {
                  chunks = []
                }

                newMediaRecorder.ondataavailable = (e) => {
                  chunks.push(e.data)
                }

                newMediaRecorder.onstop = async () => {
                  console.time("Entire function")

                  const audioBlob = new Blob(chunks, { type: "audio/webm" })
                  const audioUrl = URL.createObjectURL(audioBlob)
                  const audio = new Audio(audioUrl)

                  audio.onerror = function (err) {
                    console.error("Error playing audio:", err)
                  }

                  try {
                    const reader = new FileReader()
                    reader.readAsDataURL(audioBlob)

                    reader.onloadend = async function () {
                      const base64Audio = (reader.result as string).split(
                        ","
                      )[1] // Ensure result is not null or undefined

                      if (base64Audio) {
                        const response = await fetch("/api/speechToText", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ audio: base64Audio }),
                        })

                        const data = await response.json()

                        if (response.status !== 200) {
                          throw (
                            data.error ||
                            new Error(
                              `Request failed with status ${response.status}`
                            )
                          )
                        }

                        console.timeEnd("Speech to Text")

                        const completion = await axios.post("/api/chat", {
                          messages: [
                            {
                              role: "user",
                              content: `${data.result} Your answer has to be as consise as possible.`,
                            },
                          ],
                        })

                        handlePlayButtonClick(completion.data)
                      }
                    }
                  } catch (error) {
                    console.log(error)
                  }
                }

                setMediaRecorder(newMediaRecorder)
              })
              .catch((err) => console.error("Error accessing microphone:", err))
          }

          if (!mediaRecorderInitialized) {
            toast(
              "Please grant access to your microphone. Click the button again to speak.",
              {
                duration: 5000,
                icon: "🙌",
                style: {
                  borderRadius: "10px",
                  background: "#1E1E1E",
                  color: "#F9F9F9",
                  border: "0.5px solid #3B3C3F",
                  fontSize: "14px",
                },
                position: "top-right",
              }
            )
            return
          }

          recording
            ? null
            : toast("Listening - Click again to send", {
                icon: "🟢",
                style: {
                  borderRadius: "10px",
                  background: "#1E1E1E",
                  color: "#F9F9F9",
                  border: "0.5px solid #3B3C3F",
                  fontSize: "14px",
                },
                position: "top-right",
              })

          recording ? stopRecording() : startRecording()
        }}
        className="hover:scale-105 ease-in-out duration-500 hover:cursor-pointer text-[70px]"
      >
        <div className="rainbow-container">
          <div className="green"></div>
          <div className="pink"></div>
        </div>
      </motion.div>
    </div>
  )
}

export default AssistantButton
