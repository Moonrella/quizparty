import { useState, useRef } from 'react'
import { getAllThemes, loadEnabledThemes } from '../data/themes'

interface WheelProps {
  onResult: (themeId: string, difficulty: number) => void
}

const THEME_COLORS = ['#2D6A7A','#3A8F6A','#C4A265','#C4523B','#6B5B8A','#D4845A','#5A8FA0','#A06080','#8B7355']

const DIFF_SEGMENTS = [
  { value: 1, label: '1', color: '#2D6A7A' },
  { value: 2, label: '2', color: '#3A8F6A' },
  { value: 3, label: '3', color: '#C4A265' },
  { value: 4, label: '4', color: '#C4523B' },
  { value: 5, label: '5', color: '#6B5B8A' },
  { value: 6, label: '6', color: '#D4845A' },
]

function buildGradient(segments: { color: string }[]): string {
  const angle = 360 / segments.length
  return segments.map((seg, i) => {
    const start = i * angle
    const end = (i + 1) * angle
    return `${seg.color} ${start}deg ${end}deg`
  }).join(', ')
}

function SpinnerWheel({ segments, rotation, size }: {
  segments: { label: string; color: string }[]
  rotation: number
  size: number
}) {
  const segAngle = 360 / segments.length
  const fontSize = segments.length > 6 ? '1.2rem' : '1.8rem'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Pointer */}
      <div style={{
        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, color: 'var(--text)', fontSize: '1.2rem', lineHeight: 1,
      }}>▼</div>

      {/* Spinning disc */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '2px solid var(--border)',
        background: `conic-gradient(from 0deg, ${buildGradient(segments)})`,
        transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
      }}>
        {/* Labels */}
        {segments.map((seg, i) => {
          const midAngle = (i + 0.5) * segAngle
          const radius = size * 0.35
          const rad = (midAngle - 90) * Math.PI / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <span key={i} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${midAngle}deg)`,
              fontWeight: 800, color: '#fff', fontSize,
              whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}>{seg.label}</span>
          )
        })}
      </div>
    </div>
  )
}

export default function Wheel({ onResult }: WheelProps) {
  const enabledIds = loadEnabledThemes()
  const allThemes = getAllThemes()
  const activeThemes = enabledIds.length === 0
    ? allThemes
    : allThemes.filter(t => enabledIds.includes(t.id))

  const themeSegments = activeThemes.map((t, i) => ({
    value: t.id,
    label: t.name,
    color: THEME_COLORS[i % THEME_COLORS.length],
  }))

  const [spinning, setSpinning] = useState(false)
  const [rotLeft, setRotLeft] = useState(0)
  const [rotRight, setRotRight] = useState(0)
  const [result, setResult] = useState<{ themeId: string; themeName: string; difficulty: number } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const segAngleLeft = 360 / Math.max(themeSegments.length, 1)
  const segAngleRight = 360 / DIFF_SEGMENTS.length

  const spin = () => {
    if (spinning || themeSegments.length === 0) return
    setSpinning(true)
    setResult(null)

    const winLeft = Math.floor(Math.random() * themeSegments.length)
    const winRight = Math.floor(Math.random() * DIFF_SEGMENTS.length)
    const extraL = 3 + Math.floor(Math.random() * 2)
    const extraR = 4 + Math.floor(Math.random() * 2)

    setRotLeft(prev => prev + extraL * 360 + (360 - winLeft * segAngleLeft - segAngleLeft / 2))
    setRotRight(prev => prev + extraR * 360 + (360 - winRight * segAngleRight - segAngleRight / 2))

    timeoutRef.current = setTimeout(() => {
      setSpinning(false)
      setResult({
        themeId: themeSegments[winLeft].value,
        themeName: themeSegments[winLeft].label,
        difficulty: DIFF_SEGMENTS[winRight].value,
      })
    }, 3000)
  }

  return (
    <div className="modal-overlay fade-in">
      <div style={{ textAlign: 'center', maxWidth: 1400 }}>
        <p className="label" style={{ marginBottom: 8 }}>SPIN THE WHEELS</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>命运转盘</h2>

        <div className="flex justify-center items-center" style={{ marginBottom: 24, gap: 48 }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: '0.1em' }}>THEME</p>
            <SpinnerWheel segments={themeSegments} rotation={rotLeft} size={480} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: '0.1em' }}>LEVEL</p>
            <SpinnerWheel segments={DIFF_SEGMENTS} rotation={rotRight} size={480} />
          </div>
        </div>

        {!result ? (
          <button className="btn btn-primary btn-lg" onClick={spin}
            disabled={spinning || themeSegments.length === 0}>
            {spinning ? 'SPINNING...' : themeSegments.length === 0 ? 'NO THEMES' : 'SPIN'}
          </button>
        ) : (
          <div className="card" style={{ maxWidth: 320, margin: '0 auto' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              {result.themeName} · Lv{result.difficulty}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 12 }}>
              答对前进 {result.difficulty} 格
            </p>
            <button className="btn btn-primary" onClick={() => onResult(result.themeId, result.difficulty)}>ANSWER</button>
          </div>
        )}
      </div>
    </div>
  )
}
