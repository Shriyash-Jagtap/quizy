import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  showConfetti: boolean;
}

const Confetti: React.FC<Props> = ({ showConfetti }) => {
  const confettiPieces = useMemo(() => {
    if (!showConfetti) return [];

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: Math.random() * 0.5,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      rotation: Math.random() * 360,
    }));

    return pieces;
  }, [showConfetti]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -20,
            x: piece.x,
            rotate: piece.rotation,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: piece.rotation + 360,
            opacity: 0
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: "linear"
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: piece.color,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
