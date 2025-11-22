'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState, ButtonHTMLAttributes } from 'react'

interface LiquidButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * LiquidButton - Interactive button with morphing liquid fill animation
 * Features: Elastic scale, ripple effect, liquid fill on hover
 */
export default function LiquidButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LiquidButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-[#5cc9ad] text-[#0a2f23] border-transparent hover:bg-[#4db89c]',
    secondary: 'bg-[#5cc9ad] text-[#0a2f23] border-transparent hover:bg-[#4db89c]',
    ghost: 'bg-white/5 text-gray-200 border-white/10 hover:bg-emerald-950/40 hover:border-emerald-800/30'
  }
  
  return (
    <motion.button
      {...props}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      // Elastic scale on hover and press
      whileHover={{ scale: 1.0 }}
      whileTap={{ scale: 0.98 }}
      // Entrance animation
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300
      }}
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        ${variantStyles[variant]}
        rounded-xl font-semibold
        backdrop-blur-lg
        border-2
        shadow-lg hover:shadow-xl
        transition-shadow duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Liquid morphing fill on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-300/30 to-teal-300/30"
        initial={{ x: '-100%', skewX: -15 }}
        whileHover={{
          x: '100%',
          transition: {
            duration: 0.6,
            ease: 'easeInOut'
          }
        }}
      />
      
      {/* Ripple effect on press */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-white/30 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent -skew-x-12 animate-shimmer" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
