'use client'

import { motion } from 'framer-motion'
import { InputHTMLAttributes, useState } from 'react'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * GlassInput - Form input with glassmorphism and focus state animations
 * Features: Smooth focus transitions, floating label, glow effect
 */
export default function GlassInput({
  label,
  error,
  className = '',
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="relative">
      {label && (
        <motion.label
          animate={{
            y: isFocused || props.value ? -24 : 0,
            scale: isFocused || props.value ? 0.85 : 1,
            color: isFocused ? 'rgb(52, 211, 153)' : 'rgb(229, 231, 235)'
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-4 top-4 pointer-events-none font-medium origin-left"
        >
          {label}
        </motion.label>
      )}
      
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative"
      >
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={`
            w-full px-4 py-4 rounded-xl
            bg-white/5 backdrop-blur-xl
            border-2 transition-all duration-300
            ${isFocused 
              ? 'border-emerald-500' 
              : error 
                ? 'border-red-500/50' 
                : 'border-white/20'
            }
            text-white placeholder-gray-300
            focus:outline-none
            ${className}
          `}
        />
        
      </motion.div>
      
      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-300 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
