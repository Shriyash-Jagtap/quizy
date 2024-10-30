import React, { useMemo, useCallback } from 'react';
import { motion, useAnimate } from 'framer-motion';

interface ConfettiProps {
  showConfetti: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
  duration: number;
  path: string;
}

const Confetti: React.FC<ConfettiProps> = ({ showConfetti }) => {
  const [scope] = useAnimate();

  const confettiPieces = useMemo(() => {
    if (!showConfetti) return [];

    const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }).map((_, i) => {
      const xPos = Math.random() * width;
      // Create a bezier curve path for more natural movement
      const controlPoint1X = xPos + (Math.random() * 100 - 50);
      const controlPoint2X = xPos + (Math.random() * 200 - 100);
      const endX = xPos + (Math.random() * 300 - 150);
      
      return {
        id: i,
        x: xPos,
        delay: Math.random() * 0.3, // Reduced delay for faster start
        color: `hsl(${Math.random() * 360}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 20}%)`,
        rotation: Math.random() * 360,
        size: 4 + Math.random() * 4, // Varied sizes
        duration: 1 + Math.random() * 0.5, // Varied durations
        path: `M ${xPos} -20 C ${controlPoint1X} ${window.innerHeight * 0.3}, ${controlPoint2X} ${window.innerHeight * 0.6}, ${endX} ${window.innerHeight + 20}`,
      };
    });

    return pieces;
  }, [showConfetti]);

  const renderPiece = useCallback((piece: ConfettiPiece) => {
    const shapes = [
      // Square
      <rect 
        key="square" 
        width={piece.size} 
        height={piece.size} 
        fill={piece.color}
      />,
      // Circle
      <circle 
        key="circle" 
        r={piece.size / 2} 
        cx={piece.size / 2} 
        cy={piece.size / 2} 
        fill={piece.color}
      />,
      // Triangle
      <path 
        key="triangle"
        d={`M${piece.size/2} 0 L${piece.size} ${piece.size} L0 ${piece.size}Z`}
        fill={piece.color}
      />
    ];

    return shapes[Math.floor(Math.random() * shapes.length)];
  }, []);

  if (!showConfetti) return null;

  return (
    <div ref={scope} className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map(piece => (
        <motion.svg
          key={piece.id}
          width={piece.size}
          height={piece.size}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            willChange: 'transform',
            transformOrigin: 'center',
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            translateX: piece.x,
            translateY: [-20, window.innerHeight + 20],
            rotateZ: [piece.rotation, piece.rotation + 720],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for smooth motion
            times: [0, 0.2, 0.8, 1], // Control timing of opacity/scale
          }}
        >
          {renderPiece(piece)}
        </motion.svg>
      ))}
    </div>
  );
};

export default Confetti;