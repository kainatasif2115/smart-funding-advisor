'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  enableTilt?: boolean
  glassOpacity?: number
  borderGlow?: boolean
}

/**
 * GlassCard - A glassmorphism card with optional 3D tilt effect
 * Features: backdrop blur, gradient overlay, mouse tracking tilt
 */
export default function GlassCard({
  children,
  className = '',
  enableTilt = false,
  glassOpacity = 0.1,
  borderGlow = true
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl
        bg-gradient-to-br from-white/5 to-black/40
        border-2 border-gray-500/30
        outline outline-1 outline-gray-400/20 outline-offset-0
        shadow-sm
        ${className}
      `}
    >
      
      {/* Glass effect layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-fuchsia-950/[0.02] via-purple-950/[0.02] to-black/[0.04]"
        style={{ opacity: glassOpacity }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
    </motion.div>
  )
}
