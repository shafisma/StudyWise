'use client';

import { useEffect, useRef, type FC } from 'react';

interface AudioPlayerProps {
  src: string | null;
  onEnded: () => void;
}

const AudioPlayer: FC<AudioPlayerProps> = ({ src, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (src && audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [src]);

  // Don't render anything visible
  return <audio ref={audioRef} onEnded={onEnded} className="hidden" />;
};

export default AudioPlayer;
