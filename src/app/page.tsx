"use client";

import { Button } from "@/components/button";
import { useEffect, useRef, useState } from "react";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/16/solid";
import { chunks } from "./chunks-pg";
// import { playAudio } from "./play"
import Record from "@/components/record";

import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "@/components/alert";

export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reading, setReading] = useState(false);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [contextString, setContextString] = useState("");
  const [speed, setSpeed] = useState(1);
  let [alertState, setAlertState] = useState<{
    open: boolean;
    question: string | null;
    response: string | null;
  }>({
    open: false,
    question: null,
    response: null,
  });

  useEffect(() => {
    console.log("playing", cursorIndex);
    var audio = new Audio(`/audio/pg/audio-${cursorIndex}.mp3`);
    audioRef.current = audio;
    audio.playbackRate = speed;
    if (cursorIndex > 0) {
      audio.oncanplaythrough = () => {
        console.log("canplaythrough", cursorIndex);
        audio.play();
      };
    }

    audio.onended = () => {
      console.log("ended", cursorIndex);
      setCursorIndex((x) => x + 1);
    };
    return () => {
      audio.pause();
    };
  }, [cursorIndex]);

  useEffect(() => {
    audioRef.current?.pause();
    if (audioRef.current?.playbackRate) {
      audioRef.current.playbackRate = speed;
    }
    audioRef.current?.play();
  }, [speed]);

  function play() {
    audioRef?.current?.play();
    setReading(true);
  }

  function pause() {
    audioRef?.current?.pause();
    setReading(false);
  }

  useEffect(() => {
    setContextString(chunks.slice(0, cursorIndex + 1).join("\n"));
  }, [cursorIndex]);

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
    <div className="pt-12 pb-24 lg:py-24">
      <article className="prose lg:prose-2xl mx-auto dark:prose-invert px-2">
        {/* <div className="max-w-screen-lg mx-auto border-x p-4 space-y-4"> */}
        <h1>Crazy New Ideas</h1>
        <h5>May 2021</h5>
        <div className="space-x-2">
          <Button onClick={() => setSpeed(1)}>1x</Button>
          <Button onClick={() => setSpeed(1.5)}>1.5x</Button>
          <Button onClick={() => setSpeed(2)}>2x</Button>
        </div>
        <hr />
        {chunks.map((x, id) => (
          <p key={id}>{x}</p>
        ))}
      </article>
      <div className="fixed bottom-4 right-4 space-y-2">
        <Record
          contextString={contextString}
          onClick={(recording) => {
            pause();
            if (!recording) {
              return;
            }
            var audio = new Audio(`/audio/ding.mp3`);
            audio.playbackRate = 1;
            audio.oncanplaythrough = () => {
              audio.play();
            };
          }}
          onResponse={({
            question,
            response,
          }: {
            question: string | null;
            response: string | null;
          }) => {
            setAlertState({
              open: true,
              question,
              response,
            });
          }}
        />
        <Button>
          {reading ? (
            <PauseCircleIcon onClick={() => pause()} className="w-12 h-12" />
          ) : (
            <PlayCircleIcon onClick={() => play()} className="w-12 h-12" />
          )}
        </Button>
      </div>
      <div className="fixed bottom-4 left-4"></div>
      <Alert
        open={alertState.open}
        onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
      >
        <AlertTitle>{alertState.question}</AlertTitle>
        <AlertDescription>{alertState.response}</AlertDescription>
        <AlertActions>
          <Button
            onClick={() => {
              setAlertState((prev) => ({ ...prev, open: false }));
              play(); // Call the play function to start playing the audio
            }}
          >
            Close
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
