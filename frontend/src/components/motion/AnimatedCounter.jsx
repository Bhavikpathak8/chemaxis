import { useEffect, useState } from 'react';

export default function AnimatedCounter({
  target,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1800,
}) {
  const numericTarget = Number(target !== undefined ? target : (value !== undefined ? value : 0)) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * numericTarget;
      setCount(Number.isNaN(current) ? numericTarget : current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [numericTarget, duration]);

  const safeCount = Number.isNaN(count) ? numericTarget : count;

  return (
    <span>
      {prefix}
      {safeCount.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

