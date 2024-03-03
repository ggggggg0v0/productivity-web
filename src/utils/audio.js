import { useEffect, useState } from "react";

export function useAudio(mp3url) {
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    const audio = new Audio(mp3url);
    audio.onended = () => {
      audio.currentTime = 0;
    };
    setAudioElement(audio);
  }, []);

  return audioElement;
}
