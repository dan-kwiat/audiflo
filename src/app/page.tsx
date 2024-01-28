"use client"

import { Button } from "@/components/button"
import { use, useEffect, useState } from "react"
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/16/solid"
import { chunks } from "./chunks"
import { playAudio } from "./play"
import Record from "@/components/record"

export default function Page() {
  const [reading, setReading] = useState(false)
  const [cursorIndex, setCursorIndex] = useState(0)
  const [contextString, setContextString] = useState("")

  useEffect(() => {
    setContextString(chunks.slice(0, cursorIndex + 1).join("\n"))
  }, [cursorIndex])

  useEffect(() => {
    if (reading) {
      playAudio(chunks[cursorIndex], () => {
        console.log("reading", reading, cursorIndex)
        setCursorIndex((x) => x + 1)
        // setReading(false)
      })
    }
  }, [reading, cursorIndex])

  return (
    <div>
      <div className="max-w-screen-lg mx-auto border-x p-4 space-y-4">
        {chunks.map((x) => (
          <p>{x}</p>
        ))}
      </div>
      <div className="fixed bottom-4 right-4">
        <Button>
          {reading ? (
            <PauseCircleIcon
              onClick={() => setReading(false)}
              className="w-12 h-12"
            />
          ) : (
            <PlayCircleIcon
              onClick={() => setReading(true)}
              className="w-12 h-12"
            />
          )}
        </Button>
      </div>
      <div className="fixed bottom-4 left-4">
        <Record contextString={contextString} />
      </div>
    </div>
  )
}
