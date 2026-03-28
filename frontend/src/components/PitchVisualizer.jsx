import { useEffect, useRef } from 'react';

export function PitchVisualizer({ analyser, pitchHz }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = new Uint8Array(analyser.fftSize);
    let raf;

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < data.length; i += 1) {
        const x = (i / data.length) * canvas.width;
        const y = (data[i] / 255) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(`Pitch: ${pitchHz ? Math.round(pitchHz) : 0} Hz`, 16, 26);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, pitchHz]);

  return <canvas ref={canvasRef} width={860} height={170} className="visualizer" />;
}
