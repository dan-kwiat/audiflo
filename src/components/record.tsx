"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Button } from "./button"
import { MicrophoneIcon } from "@heroicons/react/16/solid"
import { playAudio } from "@/app/play"
import clsx from "clsx"

function getPrompt(input: string, contextString: string): string {
  const prompt = `Here is an excerpt from an article:

<excerpt>
${contextString}
</excerpt>

Please answer the following question from a reader:

"${input}"`
  console.log(prompt)
  return prompt
}

export default function Record({
  contextString,
  onClick,
}: {
  contextString: string
  onClick: () => void
}) {
  const [mediaRecorderInitialized, setMediaRecorderInitialized] =
    useState<boolean>(false)
  // const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
  // const inputRef = useRef<HTMLInputElement | null>(null)
  // const [inputValue, setInputValue] = useState<string>("")
  const [recording, setRecording] = useState<boolean>(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  let chunks: BlobPart[] = []

  useEffect(() => {
    if (mediaRecorder && mediaRecorderInitialized) {
      // Additional setup if needed
    }
  }, [mediaRecorder, mediaRecorderInitialized])

  const handlePlayButtonClick = (input: string): void => {
    // setAudioPlaying(true)
    playAudio(input, () => {
      // setAudioPlaying(false)
    })
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
      <Button
        onClick={() => {
          onClick()
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
                              content: getPrompt(data.result, contextString),
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
        // className="hover:scale-105 ease-in-out duration-500 hover:cursor-pointer text-[70px]"
      >
        <MicrophoneIcon
          className={clsx(
            `w-12 h-12 !text-red-500`,
            recording ? "animate-pulse" : ""
          )}
        />
      </Button>
    </div>
  )
}
