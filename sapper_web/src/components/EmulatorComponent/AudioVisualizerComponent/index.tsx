import React, { useEffect, useRef } from 'react';
import './index.css';

interface AudioVisualizerProps {
    audioStream: MediaStream | null;
    isRecording: boolean;
}

const AudioVisualizerComponent: React.FC<AudioVisualizerProps> = ({ audioStream, isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !audioStream || !isRecording) return;

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;

        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');

        if (!canvasCtx) return;

        const draw = () => {
            if (!isRecording) {
                cancelAnimationFrame(animationRef.current);
                return;
            }

            animationRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                canvasCtx.fillStyle = `rgb(66, 135, 245, ${barHeight / canvas.height + 0.2})`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (audioContext.state !== 'closed') {
                source.disconnect();
                audioContext.close();
            }
        };
    }, [audioStream, isRecording]);

    return (
        <div className="audio-visualizer">
            <canvas ref={canvasRef} width={300} height={60} />
        </div>
    );
};

export default AudioVisualizerComponent;