import { useEffect, useRef, useState } from 'react'
import { type Player, type BoardTile } from '../types'

interface BoardProps {
  board: BoardTile[]
  players: Player[]
  currentPlayerIndex: number
  rows: number
  cols: number
  wrongGlow?: number | null
}

const TILE_COLORS: Record<string, string> = {
  wheel: '#2D6A7A',
  fortune: '#C4A265',
  property: '#3A8F6A',
  treasure: '#C4523B',
  safe: '#B0ADA6',
  empty: 'transparent',
}

const TILE_SHAPES: Record<string, string> = {
  wheel: '●',
  fortune: '◆',
  property: '■',
  treasure: '▲',
  safe: '○',
}

interface Arrow { x1: number; y1: number; x2: number; y2: number; angle: number; mx: number; my: number }

export default function Board({ board, players, currentPlayerIndex, rows, cols, wrongGlow }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [arrows, setArrows] = useState<Arrow[]>([])
  const tileMap = new Map(board.map(t => [`${t.row}-${t.col}`, t]))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const drawArrows = () => {
      const containerRect = container.getBoundingClientRect()
      const tileEls = container.querySelectorAll<HTMLElement>('[data-tile-index]')
      const centers = new Map<number, { x: number; y: number }>()

      tileEls.forEach(el => {
        const idx = Number(el.dataset.tileIndex)
        const rect = el.getBoundingClientRect()
        centers.set(idx, {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        })
      })

      const newArrows: Arrow[] = []
      for (let i = 0; i < board.length - 1; i++) {
        const from = centers.get(i)
        const to = centers.get(i + 1)
        if (from && to) {
          const dx = to.x - from.x
          const dy = to.y - from.y
          const dist = Math.hypot(dx, dy)
          if (dist < 60) continue
          const angle = Math.atan2(dy, dx)
          // Line starts after tile edge, ends before next tile edge
          const pad = 36
          const x1 = from.x + Math.cos(angle) * pad
          const y1 = from.y + Math.sin(angle) * pad
          const x2 = to.x - Math.cos(angle) * pad
          const y2 = to.y - Math.sin(angle) * pad
          newArrows.push({ x1, y1, x2, y2, angle, mx: x2, my: y2 })
        }
      }
      setArrows(newArrows)
    }

    requestAnimationFrame(drawArrows)
    window.addEventListener('resize', drawArrows)
    return () => window.removeEventListener('resize', drawArrows)
  }, [board])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Background panel (behind everything) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 0,
      }} />

      {/* Arrows layer (above background, below tiles) */}
      {arrows.length > 0 && (
        <svg style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1,
        }}>
          {arrows.map((a, i) => {
            const deg = a.angle * 180 / Math.PI
            return (
              <g key={i}>
                <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                  stroke="var(--border)" strokeWidth={1.5} />
                <polygon
                  points="0,-3 5,0 0,3"
                  fill="var(--text-dim)"
                  opacity={0.45}
                  transform={`translate(${a.mx},${a.my}) rotate(${deg})`}
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Grid (transparent background so arrows show through) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: 20,
        padding: 24,
        position: 'relative', zIndex: 2,
      }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const tile = tileMap.get(`${r}-${c}`)
            if (!tile || tile.type === 'empty') {
              return <div key={`${r}-${c}`} />
            }

            const playersHere = players.filter(p => p.position === tile.index)
            const isCurrent = players[currentPlayerIndex]?.position === tile.index
            const hasGlow = wrongGlow !== null && wrongGlow !== undefined && players[wrongGlow]?.position === tile.index
            const color = TILE_COLORS[tile.type] || TILE_COLORS.safe
            const shape = TILE_SHAPES[tile.type] || '○'
            const owned = tile.type === 'property' && tile.ownerId
            const owner = owned ? players.find(p => p.id === tile.ownerId) : null

            return (
              <div key={tile.index} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <div
                  data-tile-index={tile.index}
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    border: hasGlow ? '3px solid var(--danger)' : isCurrent ? `3px solid ${players[currentPlayerIndex]?.color}` : `2px solid ${color}30`,
                    background: 'var(--surface)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    position: 'relative', transition: 'all 0.2s',
                    boxShadow: hasGlow ? '0 0 20px 8px rgba(196,82,59,0.5), inset 0 0 8px rgba(196,82,59,0.2)' : isCurrent ? `0 0 0 5px ${players[currentPlayerIndex]?.color}18` : 'none',
                    zIndex: 3,
                  }}>
                  <span style={{
                    fontSize: '1rem', fontWeight: 900, color, lineHeight: 1,
                  }}>{shape}</span>
                  {owned && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 12, height: 12, borderRadius: '50%',
                      background: owner?.color || '#888',
                      border: '2px solid var(--surface)',
                    }} />
                  )}
                </div>

                {playersHere.length > 0 && (
                  <div style={{ display: 'flex', gap: 3, zIndex: 3 }}>
                    {playersHere.map(p => (
                      <div key={p.id} title={p.name} style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: p.color,
                        border: '2px solid var(--surface)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    ))}
                  </div>
                )}

                <span style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  color: 'var(--text-dim)', letterSpacing: '0.05em',
                  zIndex: 3,
                }}>{tile.index + 1}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
