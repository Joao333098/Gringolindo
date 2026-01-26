import React from 'react';
import { motion } from 'framer-motion';

const KSLogo = ({ size = "text-4xl" }) => {
  return (
    <div className={`relative font-black tracking-tighter ${size} select-none`}>
      <motion.div
        className="text-cyber-red absolute top-0 left-0"
        animate={{
          x: [-2, 2, -1, 0],
          y: [1, -1, 0],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.2,
          repeatType: "mirror",
          repeatDelay: 3
        }}
      >
        KS SYSTEM
      </motion.div>
      <motion.div
        className="text-white relative z-10 mix-blend-difference"
        animate={{
          x: [2, -2, 1, 0],
          y: [-1, 1, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.3,
          repeatType: "mirror",
          repeatDelay: 4
        }}
      >
        KS SYSTEM
      </motion.div>
      <div className="text-cyber-red absolute top-0 left-0 blur-sm opacity-50">
        KS SYSTEM
      </div>
    </div>
  );
};

export default KSLogo;
