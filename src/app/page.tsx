"use client"

import { Button } from "@/components/button"
import { useEffect, useRef, useState } from "react"
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/16/solid"
import { chunks } from "./chunks-pg"
// import { playAudio } from "./play"
import Record from "@/components/record"

import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "@/components/alert"
import clsx from "clsx"
import { Slider } from "@/components/player/Slider"

export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [reading, setReading] = useState(false)
  const [cursorIndex, setCursorIndex] = useState(-1)
  const [contextString, setContextString] = useState("")
  const [speed, setSpeed] = useState(1)
  let [alertState, setAlertState] = useState<{
    open: boolean
    question: string | null
    response: string | null
  }>({
    open: false,
    question: null,
    response: null,
  })

  useEffect(() => {
    console.log("playing", cursorIndex)
    var audio = new Audio(`/audio/pg/audio-${cursorIndex}.mp3`)
    audioRef.current = audio
    audio.playbackRate = speed
    if (cursorIndex > -1) {
      audio.oncanplaythrough = () => {
        console.log("canplaythrough", cursorIndex)
        audio.play()
      }
    }

    audio.onended = () => {
      console.log("ended", cursorIndex)
      setCursorIndex((x) => x + 1)
    }
    return () => {
      audio.pause()
    }
  }, [cursorIndex])

  useEffect(() => {
    if (audioRef.current?.playbackRate) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  function play() {
    if (cursorIndex === -1) {
      setCursorIndex(0)
    }
    audioRef?.current?.play()
    setReading(true)
  }

  function pause() {
    audioRef?.current?.pause()
    setReading(false)
  }

  useEffect(() => {
    setContextString(chunks.slice(0, cursorIndex + 1).join("\n"))
  }, [cursorIndex])

  // useEffect(() => {
  //   if (reading) {
  //     playAudio(chunks[cursorIndex], () => {
  //       console.log("reading", reading, cursorIndex)
  //       setCursorIndex((x) => x + 1)
  //       // setReading(false)
  //     })
  //   }
  // }, [reading, cursorIndex])
  return (
    <div className="pt-12 pb-36 lg:pt-24">
      <article className="prose lg:prose-2xl mx-auto dark:prose-invert px-2">
        {/* <div className="max-w-screen-lg mx-auto border-x p-4 space-y-4"> */}
        <h2 className="uppercase text-gray-400 dark:text-gray-800">
          The New Testament
        </h2>
        <h1 className="text-red-900 dark:text-red-700">
          The Epistle of Paul the Apostle to the Philemon
        </h1>
        <p className="text-gray-400 dark:text-gray-500 font-medium">
          A long time ago
        </p>

        <hr />
        {chunks.map((x, idx) => (
          <p
            key={idx}
            className={clsx(
              cursorIndex === idx ? "bg-yellow-100 dark:bg-yellow-900" : ""
            )}
            onClick={() => {
              setCursorIndex(idx)
              setReading(true)
            }}
          >
            {x}
          </p>
        ))}
      </article>
      <div className="fixed bottom-4 right-4 space-y-2"></div>
      <div className="fixed inset-x-0 bottom-0 z-10 lg:left-112 xl:left-120">
        <div className="bg-white/90 px-4 py-4 shadow shadow-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-sm md:px-6">
          <div className="max-w-screen-lg mx-auto flex items-center gap-6 ">
            <Button>
              {reading ? (
                <PauseCircleIcon
                  onClick={() => pause()}
                  className="w-12 h-12"
                />
              ) : (
                <PlayCircleIcon onClick={() => play()} className="w-12 h-12" />
              )}
            </Button>
            <Record
              contextString={contextString}
              onClick={(recording) => {
                pause()
                if (!recording) {
                  return
                }
                var audio = new Audio(`/audio/ding.mp3`)
                audio.playbackRate = 1
                audio.oncanplaythrough = () => {
                  audio.play()
                }
              }}
              onResponse={({
                question,
                response,
              }: {
                question: string | null
                response: string | null
              }) => {
                setAlertState({
                  open: true,
                  question,
                  response,
                })
              }}
            />
            <Slider
              numberFormatter={{ format: (x) => `${x}x` } as Intl.NumberFormat}
              maxValue={chunks.length}
              step={1}
              value={[cursorIndex + 1]}
              onChangeEnd={([value]) => setCursorIndex(value - 1)}
            />
            <Button
              onClick={() => {
                if (speed >= 2) {
                  setSpeed(1)
                } else {
                  setSpeed(speed + 0.5)
                }
              }}
            >
              {speed}x
            </Button>
          </div>
        </div>
        {/* <AudioPlayer /> */}
      </div>
      <Alert
        open={alertState.open}
        onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
      >
        <AlertTitle>{alertState.question}</AlertTitle>
        <AlertDescription>{alertState.response}</AlertDescription>
        <AlertActions>
          <Button
            plain
            onClick={() => {
              setAlertState((prev) => ({ ...prev, open: false }))
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setAlertState((prev) => ({ ...prev, open: false }))
              play()
            }}
          >
            Continue
          </Button>
        </AlertActions>
      </Alert>
    </div>
  )
}
