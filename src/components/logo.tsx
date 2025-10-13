import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeMap = {
    sm: { container: 'w-6 h-6', text: 'text-sm' },
    md: { container: 'w-8 h-8', text: 'text-lg' },
    lg: { container: 'w-12 h-12', text: 'text-xl' },
    xl: { container: 'w-16 h-16', text: 'text-2xl' }
  }

  const { container, text } = sizeMap[size]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${container} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L18 4L8 14H18L6 20L6 4Z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
            transform="skewX(-6) translate(1, 0)"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${text} text-gray-900`}>
          Spine<span className="text-indigo-600">Mate</span>
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`${sizeMap[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-3/4 h-3/4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 4L18 4L8 14H18L6 20L6 4Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
          transform="skewX(-6) translate(1, 0)"
        />
      </svg>
    </div>
  )
}