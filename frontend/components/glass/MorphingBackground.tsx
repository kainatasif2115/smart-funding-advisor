'use client'

import { motion } from 'framer-motion'

/**
 * MorphingBackground - Animated blob shapes that flow organically
 * Features: Continuous loop animations, gradient morphing, layered depth
 */
export default function MorphingBackground() {
  // Blob animation variants for organic movement
  const blobAnimation = (custom: number) => ({
    x: [0, 100, -50, 0],
    y: [0, -100, 50, 0],
    scale: [1, 1.2, 0.8, 1],
    rotate: [0, 90, 180, 0],
    transition: {
      duration: 20 + custom * 5, // Staggered durations
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  })
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Simple morphing gradient between black and dark emerald/teal */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at top left, #001a1a 0%, #000000 50%, #000000 100%)',
            'radial-gradient(ellipse at top right, #000000 0%, #001a1a 50%, #000000 100%)',
            'radial-gradient(ellipse at bottom right, #000000 0%, #000000 50%, #001a1a 100%)',
            'radial-gradient(ellipse at bottom left, #001a1a 0%, #000000 50%, #000000 100%)',
            'radial-gradient(ellipse at top left, #001a1a 0%, #000000 50%, #000000 100%)'
          ]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}
