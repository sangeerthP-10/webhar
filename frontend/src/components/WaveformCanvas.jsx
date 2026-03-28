import { useEffect, useRef } from 'react';

export function WaveformCanvas({ analyser }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = new Uint8Array(analyser.fftSize);
    let raf = null;

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
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
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} width={900} height={160} className="h-36 w-full rounded-xl border border-cyan-400/30" />;
}
