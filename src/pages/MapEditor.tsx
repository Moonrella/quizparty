import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { type TileType, type BoardTile, type BoardPreset } from '../types'
import { BOARD_PRESETS, getBoardPreset, loadCustomBoards } from '../data/boardPresets'

const TILE_OPTIONS: { type: TileType; shape: string; color: string; label: string }[] = [
  { type: 'safe',     shape: '○', color: '#B0ADA6', label: '安全' },
  { type: 'property', shape: '■', color: '#3A8F6A', label: '地产' },
  { type: 'wheel',    shape: '●', color: '#2D6A7A', label: '转盘' },
  { type: 'fortune',  shape: '◆', color: '#C4A265', label: '命运' },
  { type: 'treasure', shape: '▲', color: '#C4523B', label: '宝箱' },
]

const STORAGE_KEY = 'quizparty_custom_boards'

function saveCustomBoards(boards: BoardPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
}

export default function MapEditor() {
  const [mode, setMode] = useState<'select' | 'edit'>('select')
  const [customBoards, setCustomBoards] = useState<BoardPreset[]>(loadCustomBoards())
  const [boardName, setBoardName] = useState('')
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(6)

  // Click-ordered tiles: order matters
  const [orderedTiles, setOrderedTiles] = useState<BoardTile[]>([])
  const [selectedType, setSelectedType] = useState<TileType>('safe')

  const editorRef = useRef<HTMLDivElement>(null)
  const [arrows, setArrows] = useState<{ x1: number; y1: number; x2: number; y2: number; mx: number; my: number; angle: number }[]>([])

  // Draw arrows
  useEffect(() => {
    const container = editorRef.current
    if (!container) return
    const draw = () => {
      const rect = container.getBoundingClientRect()
      const els = container.querySelectorAll<HTMLElement>('[data-editor-tile]')
      const centers = new Map<number, { x: number; y: number }>()
      els.forEach(el => {
        const idx = Number(el.dataset.editorTile)
        const r = el.getBoundingClientRect()
        centers.set(idx, { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top })
      })
      const sorted = [...orderedTiles].sort((a, b) => a.index - b.index)
      const newArrows: typeof arrows = []
      for (let i = 0; i < sorted.length - 1; i++) {
        const from = centers.get(sorted[i].index)
        const to = centers.get(sorted[i + 1].index)
        if (from && to) {
          const dx = to.x - from.x, dy = to.y - from.y
          const dist = Math.hypot(dx, dy)
          if (dist < 60) continue
          const angle = Math.atan2(dy, dx)
          const pad = 34
          newArrows.push({
            x1: from.x + Math.cos(angle) * pad, y1: from.y + Math.sin(angle) * pad,
            x2: to.x - Math.cos(angle) * pad, y2: to.y - Math.sin(angle) * pad,
            mx: to.x - Math.cos(angle) * pad, my: to.y - Math.sin(angle) * pad,
            angle,
          })
        }
      }
      setArrows(newArrows)
    }
    requestAnimationFrame(draw)
  }, [orderedTiles, rows, cols])

  const startBlank = () => {
    setOrderedTiles([])
    setBoardName('我的棋盘')
    setMode('edit')
  }

  const startFromPreset = (presetId: string) => {
    const board = getBoardPreset(presetId)
    const active = board.tiles.filter(t => t.type !== 'empty').sort((a, b) => a.index - b.index)
    setOrderedTiles(active)
    setBoardName(board.name)
    setRows(board.rows)
    setCols(board.cols)
    setMode('edit')
  }

  const handleCellClick = (r: number, c: number) => {
    const existing = orderedTiles.find(t => t.row === r && t.col === c)
    if (existing) {
      // Change type only, keep position and index
      const info2 = TILE_OPTIONS.find(o => o.type === selectedType)!
      setOrderedTiles(prev => prev.map(t =>
        t.row === r && t.col === c
          ? { ...t, type: selectedType, label: info2.label, emoji: info2.shape }
          : t
      ))
      return
    }
    // Add new tile at next index
    const info = TILE_OPTIONS.find(o => o.type === selectedType)!
    const newTile: BoardTile = {
      index: orderedTiles.length,
      type: selectedType,
      label: info.label,
      emoji: info.shape,
      row: r, col: c,
      propertyPrice: selectedType === 'property' ? 50 + orderedTiles.length * 8 : undefined,
      toll: selectedType === 'property' ? 15 + Math.floor(orderedTiles.length / 2) * 8 : undefined,
    }
    setOrderedTiles(prev => [...prev, newTile])
  }

  const handleTypeChange = (type: TileType) => {
    setSelectedType(type)
  }

  const handleClear = () => {
    setOrderedTiles([])
  }

  const handleSave = () => {
    if (!boardName.trim() || orderedTiles.length < 2) return
    const id = `custom_${Date.now()}`
    const maxRow = Math.max(...orderedTiles.map(t => t.row)) + 1
    const maxCol = Math.max(...orderedTiles.map(t => t.col)) + 1
    const board: BoardPreset = {
      id, name: boardName, emoji: '✏️', description: '自定义棋盘',
      rows: maxRow, cols: maxCol, tiles: orderedTiles, size: orderedTiles.length,
    }
    const updated = [...customBoards, board]
    setCustomBoards(updated)
    saveCustomBoards(updated)
    alert('保存成功！返回大厅即可选择此棋盘。')
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定删除？')) return
    const updated = customBoards.filter(b => b.id !== id)
    setCustomBoards(updated)
    saveCustomBoards(updated)
  }

  // ── Select mode ──
  if (mode === 'select') {
    return (
      <div className="page fade-in">
        <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
          <Link to="/" className="btn btn-ghost btn-sm">← BACK</Link>
          <div>
            <p className="label" style={{ textAlign: 'center' }}>MAP EDITOR</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center' }}>地图编辑器</h1>
          </div>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <p className="label">PRESETS</p>
          <div className="flex flex-col gap-sm">
            {BOARD_PRESETS.map(b => (
              <div key={b.id} className="card" style={{ padding: 16 }}>
                <div className="flex justify-between items-center">
                  <div>
                    <span style={{ fontWeight: 700 }}>{b.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: 8 }}>{b.description}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => startFromPreset(b.id)}>EDIT COPY</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p className="label">MY BOARDS</p>
          <div className="flex flex-col gap-sm">
            {customBoards.map(b => (
              <div key={b.id} className="card" style={{ padding: 16 }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 700 }}>{b.name}</span>
                  <div className="flex gap-sm">
                    <button className="btn btn-ghost btn-sm" onClick={() => startFromPreset(b.id)}>EDIT</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>×</button>
                  </div>
                </div>
              </div>
            ))}
            {customBoards.length === 0 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>还没有自定义棋盘</p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <p className="label">NEW BOARD</p>
          <div className="flex gap-sm items-center flex-wrap" style={{ marginBottom: 12 }}>
            <div>
              <label>ROWS</label>
              <input className="input" type="number" min={3} max={10} value={rows}
                onChange={e => setRows(Number(e.target.value))} style={{ width: 60 }} />
            </div>
            <div>
              <label>COLS</label>
              <input className="input" type="number" min={3} max={10} value={cols}
                onChange={e => setCols(Number(e.target.value))} style={{ width: 60 }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={startBlank}>CREATE</button>
        </div>
      </div>
    )
  }

  // ── Edit mode ──
  return (
    <div className="page fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setMode('select')}>← BACK</button>
        <input className="input" value={boardName} onChange={e => setBoardName(e.target.value)}
          style={{ textAlign: 'center', fontWeight: 700, maxWidth: 200 }} />
        <button className="btn btn-primary btn-sm" onClick={handleSave}
          disabled={orderedTiles.length < 2}>SAVE</button>
      </div>

      {/* Tool palette */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="flex gap-sm items-center flex-wrap">
          <span className="label" style={{ margin: 0 }}>TYPE:</span>
          {TILE_OPTIONS.map(t => (
            <button key={t.type} onClick={() => handleTypeChange(t.type)}
              className={`btn btn-sm ${selectedType === t.type ? 'btn-primary' : 'btn-ghost'}`}
              style={{ gap: 4, minWidth: 65 }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: selectedType === t.type ? '#fff' : t.color }}>{t.shape}</span>
              <span style={{ fontSize: '0.7rem' }}>{t.label}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleClear}>CLEAR ALL</button>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 12, textAlign: 'center' }}>
        点击空格子按顺序放置 · 点击已放置的格子可更换类型（不改变排序）
      </p>

      {/* Editor grid */}
      <div ref={editorRef} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', zIndex: 0,
        }} />
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
                  <polygon points="0,-3 5,0 0,3" fill="var(--text-dim)" opacity={0.45}
                    transform={`translate(${a.mx},${a.my}) rotate(${deg})`} />
                </g>
              )
            })}
          </svg>
        )}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20,
          padding: 24, position: 'relative', zIndex: 2,
        }}>
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const tile = orderedTiles.find(t => t.row === r && t.col === c)
              const info = tile ? TILE_OPTIONS.find(o => o.type === tile.type) : null

              return (
                <div key={`${r}-${c}`} onClick={() => handleCellClick(r, c)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 4, cursor: 'pointer', userSelect: 'none',
                  }}>
                  <div
                    data-editor-tile={tile ? tile.index : undefined}
                    style={{
                      width: 52, height: 52, borderRadius: '50%',
                      border: tile ? `2px solid ${info?.color || 'var(--border)'}60` : '2px dashed var(--border)',
                      background: 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s', zIndex: 3,
                    }}>
                    <span style={{
                      fontSize: '1rem', fontWeight: 900,
                      color: info?.color || 'var(--text-dim)', lineHeight: 1, opacity: tile ? 1 : 0.3,
                    }}>
                      {tile ? info?.shape : '·'}
                    </span>
                  </div>
                  {tile && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent)', zIndex: 3 }}>
                      {tile.index + 1}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-lg flex-wrap justify-center" style={{ marginTop: 16 }}>
        {TILE_OPTIONS.map(t => (
          <div key={t.type} className="flex gap-xs items-center">
            <span style={{ fontWeight: 900, color: t.color }}>{t.shape}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
