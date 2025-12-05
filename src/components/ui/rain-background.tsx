"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface RainDrop {
  id: number
  left: number
  animationDuration: number
  opacity: number
  size: number
  delay: number
}

interface Lightning {
  id: number
  type: "flash" | "bolt"
  intensity: number
  duration: number
  path: string
  branches: string[]
}

interface RainBackgroundProps {
  intensity?: number
  speed?: number
  color?: string
  angle?: number
  dropSize?: {
    min: number
    max: number
  }
  lightningEnabled?: boolean
  lightningFrequency?: number
  thunderEnabled?: boolean
  thunderVolume?: number
  thunderDelay?: number
  className?: string
  children?: React.ReactNode
}

export function RainBackground({
  intensity = 100,
  speed = 1,
  color = "rgba(174, 194, 224, 0.6)",
  angle = 0,
  dropSize = { min: 1, max: 3 },
  lightningEnabled = false,
  lightningFrequency = 8,
  thunderEnabled = false,
  thunderVolume = 0.5,
  thunderDelay = 2,
  className,
  children,
}: RainBackgroundProps) {
  const [raindrops, setRaindrops] = useState<RainDrop[]>([])
  const [lightning, setLightning] = useState<Lightning | null>(null)
  const [, setIsFlashing] = useState(false)
  const thunderAudioRef = useRef<HTMLAudioElement | null>(null)
  const lightningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize thunder audio
  useEffect(() => {
    if (thunderEnabled && typeof window !== "undefined") {
      thunderAudioRef.current = new Audio()
      thunderAudioRef.current.volume = thunderVolume
      thunderAudioRef.current.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
    }
  }, [thunderEnabled, thunderVolume])

  // Generate raindrops
  useEffect(() => {
    const drops: RainDrop[] = []
    for (let i = 0; i < intensity; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: (Math.random() * 1 + 0.5) / speed,
        opacity: Math.random() * 0.6 + 0.2,
        size: Math.random() * (dropSize.max - dropSize.min) + dropSize.min,
        delay: Math.random() * 2,
      })
    }
    setRaindrops(drops)
  }, [intensity, speed, dropSize])

  // Fractal Lightning Generation
  const createFractalBolt = useCallback((startX: number, startY: number, endX: number, endY: number, displacement: number): string => {
    if (displacement < 1) {
      return ` L ${endX} ${endY}`;
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Perpendicular offset
    const normalX = -(endY - startY);
    const normalY = endX - startX;
    const len = Math.sqrt(normalX * normalX + normalY * normalY);

    // Random offset
    const offset = (Math.random() - 0.5) * displacement;

    const displacedX = midX + (normalX / len) * offset;
    const displacedY = midY + (normalY / len) * offset;

    return createFractalBolt(startX, startY, displacedX, displacedY, displacement / 2) +
      createFractalBolt(displacedX, displacedY, endX, endY, displacement / 2);
  }, []);

  const generateBoltData = useCallback((target?: { x: number, y: number }) => {
    const startX = target ? target.x + (Math.random() - 0.5) * 10 : Math.random() * 80 + 10;
    const startY = 0;
    const endX = target ? target.x : startX + (Math.random() - 0.5) * 40;
    const endY = target ? target.y : 100;

    // Main path
    const mainPath = `M ${startX} ${startY}` + createFractalBolt(startX, startY, endX, endY, 20);

    // Generate branches
    const branches: string[] = [];
    const numBranches = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numBranches; i++) {
      // Pick a random point along the general direction (simplified)
      const progress = 0.3 + Math.random() * 0.4; // Branch from middle 40%
      const branchStartX = startX + (endX - startX) * progress;
      const branchStartY = startY + (endY - startY) * progress;

      const branchLen = 20 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const branchEndX = branchStartX + Math.cos(angle) * branchLen;
      const branchEndY = branchStartY + Math.abs(Math.sin(angle)) * branchLen; // Always go down-ish

      branches.push(`M ${branchStartX} ${branchStartY}` + createFractalBolt(branchStartX, branchStartY, branchEndX, branchEndY, 10));
    }

    return { path: mainPath, branches };
  }, [createFractalBolt]);

  // Lightning effect
  const triggerLightning = useCallback((coordinates?: { x: number, y: number }) => {
    if (!lightningEnabled) return

    const type = coordinates ? "bolt" : (["bolt", "bolt", "flash"] as const)[Math.floor(Math.random() * 3)]
    const intensity = Math.random() * 0.3 + 0.7; // High intensity for realism
    const duration = type === "flash" ? 50 + Math.random() * 100 : 100 + Math.random() * 150; // Faster, snappier

    const { path, branches } = type === 'bolt' ? generateBoltData(coordinates) : { path: '', branches: [] };

    const newLightning: Lightning = {
      id: Date.now(),
      type,
      intensity,
      duration,
      path,
      branches
    }

    setLightning(newLightning)
    setIsFlashing(true)

    setTimeout(() => {
      setIsFlashing(false)
      setLightning(null)
    }, duration)

    if (thunderEnabled && thunderAudioRef.current) {
      const delay = coordinates ? 0 : thunderDelay * 1000
      setTimeout(() => {
        if (thunderAudioRef.current) {
          thunderAudioRef.current.currentTime = 0
          thunderAudioRef.current.play().catch(() => console.log("Thunder blocked"))
        }
      }, delay)
    }

    if (!coordinates) {
      const nextLightning = (lightningFrequency + Math.random() * lightningFrequency) * 1000
      lightningTimeoutRef.current = setTimeout(() => triggerLightning(), nextLightning)
    }
  }, [lightningEnabled, lightningFrequency, thunderEnabled, thunderDelay, generateBoltData])

  // Click Handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }

      // Calculate percentage coordinates
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      triggerLightning({ x, y });
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [triggerLightning]);

  // Start lightning cycle
  useEffect(() => {
    if (lightningEnabled) {
      const initialDelay = Math.random() * lightningFrequency * 1000
      lightningTimeoutRef.current = setTimeout(() => triggerLightning(), initialDelay)
    }

    return () => {
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current)
      }
    }
  }, [lightningEnabled, lightningFrequency]) // Removed triggerLightning from dependency to avoid loop reset on click



  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Lightning Effects */}
      {lightning && (
        <>
          {/* Screen Flash */}
          {lightning.type === "flash" && (
            <div
              className="animate-lightning-flash pointer-events-none absolute inset-0 z-20"
              style={{
                background: `radial-gradient(circle, rgba(255, 255, 255, ${lightning.intensity * 0.8}) 0%, rgba(167, 139, 250, ${lightning.intensity * 0.2}) 50%, transparent 100%)`,
                animationDuration: `${lightning.duration}ms`,
              }}
            />
          )}

          {/* Lightning Bolt */}
          {lightning.type === "bolt" && (
            <div className="pointer-events-none absolute inset-0 z-20">
              <svg
                className="animate-lightning-bolt h-full w-full"
                style={{ animationDuration: `${lightning.duration}ms` }}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.5" result="blur1" />
                    <feGaussianBlur stdDeviation="2" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g filter="url(#glow)">
                  {/* Main Bolt Glow */}
                  <path
                    d={lightning.path}
                    stroke={`rgba(139, 92, 246, ${lightning.intensity * 0.6})`}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main Bolt Core */}
                  <path
                    d={lightning.path}
                    stroke={`rgba(255, 255, 255, ${lightning.intensity})`}
                    strokeWidth="0.4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Branches */}
                  {lightning.branches && lightning.branches.map((branch, i) => (
                    <React.Fragment key={i}>
                      <path
                        d={branch}
                        stroke={`rgba(139, 92, 246, ${lightning.intensity * 0.4})`}
                        strokeWidth="1"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={branch}
                        stroke={`rgba(255, 255, 255, ${lightning.intensity * 0.8})`}
                        strokeWidth="0.2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </React.Fragment>
                  ))}
                </g>
              </svg>
            </div>
          )}
        </>
      )}

      {/* Rain container */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: "center center",
        }}
      >
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="animate-rain-fall absolute"
            style={{
              left: `${drop.left}%`,
              width: `${drop.size}px`,
              height: `${drop.size * 10}px`,
              background: `linear-gradient(to bottom, transparent, ${color})`,
              borderRadius: `${drop.size}px`,
              animationDuration: `${drop.animationDuration}s`,
              animationDelay: `${drop.delay}s`,
              opacity: drop.opacity,
              top: "-20px",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes rain-fall {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(calc(100vh + 20px));
          }
        }

        @keyframes lightning-flash {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
          40% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-bolt {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20% {
            opacity: 0.7;
          }
          30% {
            opacity: 1;
          }
          40% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
          60% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-rain-fall {
          animation: rain-fall linear infinite;
        }

        .animate-lightning-flash {
          animation: lightning-flash ease-out forwards;
        }

        .animate-lightning-bolt {
          animation: lightning-bolt ease-out forwards;
        }
      `}</style>
    </div>
  )
}

interface ThunderAudioProps {
  volume: number
  onPlay?: () => void
}

export function useThunderAudio({ volume, onPlay }: ThunderAudioProps) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)()
    }
  }, [])

  const generateThunderSound = async () => {
    if (!audioContextRef.current) return

    const audioContext = audioContextRef.current
    const duration = 2 + Math.random() * 3 // 2-5 seconds
    const sampleRate = audioContext.sampleRate
    const frameCount = sampleRate * duration
    const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = arrayBuffer.getChannelData(0)

    // Generate thunder-like noise
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      let sample = 0

      // Multiple layers of noise for realistic thunder
      sample += (Math.random() * 2 - 1) * Math.exp(-t * 2) * 0.5 // Initial crack
      sample += (Math.random() * 2 - 1) * Math.exp(-t * 0.5) * 0.3 // Rumble
      sample += Math.sin(t * 60 + Math.random() * 10) * Math.exp(-t * 1) * 0.2 // Low frequency

      // Apply envelope for natural fade
      const envelope = Math.exp(-t * 0.8) * (1 - Math.exp(-t * 10))
      channelData[i] = sample * envelope * volume
    }

    // Play the generated sound
    const source = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()

    source.buffer = arrayBuffer
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
    gainNode.gain.value = volume

    source.start()
    onPlay?.()
  }

  return {
    playThunder: generateThunderSound,
  }
}
