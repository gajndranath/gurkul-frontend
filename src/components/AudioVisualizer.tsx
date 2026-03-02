import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  streamRef: React.RefObject<MediaStream | null>;
  color?: string;
  isMirror?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ streamRef, color = "#3b82f6", isMirror = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!streamRef.current || streamRef.current.getAudioTracks().length === 0) return;

    const initAudio = async () => {
      try {
        // @ts-ignore
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        
        audioContextRef.current = new (AudioContextClass as any)();
        if (!audioContextRef.current) return;
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        // Use a smaller FFT size for smoother, wider wave bars
        analyserRef.current.fftSize = 64; 
        
        if (streamRef.current) {
          sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
          sourceRef.current.connect(analyserRef.current);
        }
        
        draw();
      } catch (err) {
        console.error("Audio visualizer init error:", err);
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillStyle = color;
        // Center the bar vertically
        const y = (height - barHeight) / 2;

        ctx.fillRect(isMirror ? width - x - barWidth : x, y, barWidth - 2, barHeight);
        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // User interaction might be required to start AudioContext, but we are in an active call so it's likely fine.
    initAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (analyserRef.current) analyserRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
         audioContextRef.current.close().catch(console.error);
      }
    };
  }, [streamRef, color, isMirror]);

  return <canvas ref={canvasRef} width={200} height={40} className="w-full h-10 opacity-80" />;
};
