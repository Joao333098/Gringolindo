import React from 'react';
import { motion } from 'framer-motion';

const KSLogo = ({ size = 'medium', animated = true }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  const glitchAnimation = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className={`font-black tracking-tighter select-none ${sizeClasses[size]} relative group`}>
      {/* Glitch Effect Layers */}
      {animated && (
        <>
          <span className="absolute top-0 left-0 -ml-1 text-cyber-red opacity-0 group-hover:opacity-70 animate-pulse"
                style={{clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)', transform: 'translate(-2px, 2px)'}}>
            KS SYSTEM
          </span>
          <span className="absolute top-0 left-0 -ml-1 text-blue-500 opacity-0 group-hover:opacity-70 animate-pulse"
                style={{clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)', transform: 'translate(2px, -2px)'}}>
            KS SYSTEM
          </span>
        </>
      )}

      {/* Main Text */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={glitchAnimation}
        className="flex items-center gap-2"
      >
        <div className="relative">
          <span className="text-cyber-red">K</span>
          <span className="text-white">S</span>
        </div>
        <div className="flex flex-col items-start leading-none ml-2">
            <span className="text-[0.4em] text-cyber-red-dim font-mono tracking-[0.3em]">KAELI</span>
            <span className="text-[0.4em] text-white font-mono tracking-[0.3em]">SYSTEM</span>
        </div>
      </motion.div>
    </div>
  );
};

export default KSLogo;
