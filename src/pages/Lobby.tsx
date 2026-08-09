import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createGameState, saveGameState } from '../stores/gameStore'
import { BOARD_PRESETS, loadCustomBoards } from '../data/boardPresets'
import { loadEnabledThemes } from '../data/themes'

const COLORS = ['#FF735A','#ACEBFA','#64FFAF','#FFF878','#DCC8FF','#FFE6F0','#575757','#FFFFFF']

interface PC { name: string; color: string }

export default function Lobby() {
  const navigate = useNavigate()
  const [count, setCount] = useState(4)
  const [boardId, setBoardId] = useState('classic')
  const [maxRounds, setMaxRounds] = useState(5)
  const [players, setPlayers] = useState<PC[]>(
    Array.from({ length: 8 }, (_, i) => ({ name: `Player ${i+1}`, color: COLORS[i] }))
  )
  const allBoards = [...BOARD_PRESETS, ...loadCustomBoards()]

  const upd = (i: number, k: keyof PC, v: string) =>
    setPlayers(p => { const n = [...p]; n[i] = {...n[i], [k]: v}; return n })

  const start = () => {
    const active = players.slice(0, count).filter(p => p.name.trim())
    if (active.length < 2) return
    const s = createGameState(active, boardId, loadEnabledThemes(), maxRounds)
    saveGameState(s)
    navigate('/game')
  }

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <p className="label" style={{ marginBottom: 8, letterSpacing: '0.2em' }}>Moonrella</p>
        <h1 style={{ fontSize: '4rem', fontWeight: 600, letterSpacing: '0.1em' }}>请回答!!</h1>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p className="label">BOARD</p>
        <div className="flex gap-sm flex-wrap">
          {allBoards.map(b => (
            <button key={b.id} className={`btn btn-sm ${boardId === b.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setBoardId(b.id)}>{b.name}</button>
          ))}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 8 }}>
          {allBoards.find(b => b.id === boardId)?.description}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p className="label">PLAYERS</p>
        <div className="flex gap-sm">
          {[2,3,4,5,6,7,8].map(n => (
            <button key={n} className={`btn btn-sm ${n === count ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCount(n)} style={{ width: 40, padding: '6px 0', fontWeight: 700 }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p className="label">ROUNDS</p>
        <div className="flex gap-sm">
          {[3,5,8,10,15,20].map(n => (
            <button key={n} className={`btn btn-sm ${n === maxRounds ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMaxRounds(n)} style={{ padding: '6px 14px', fontWeight: 700 }}>{n}</button>
          ))}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 6 }}>
          达到 {maxRounds} 轮后金币最多者获胜
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div className="flex flex-col gap-md">
          {players.slice(0, count).map((p, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div className="flex gap-sm items-center flex-wrap">
                {/* Color circle preview */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: p.color,
                  border: '2px solid var(--border)', flexShrink: 0,
                }} />

                <input className="input" style={{ flex: 1, minWidth: 100 }}
                  value={p.name} onChange={e => upd(i, 'name', e.target.value)} />

                <div className="flex gap-xs items-center">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => upd(i, 'color', c)}
                      style={{
                        width: 24, height: 24, borderRadius: 4, background: c,
                        border: p.color === c ? '2px solid var(--text)' : '2px solid transparent',
                        cursor: 'pointer',
                      }} />
                  ))}
                  <input type="color" value={p.color} onChange={e => upd(i, 'color', e.target.value)}
                    style={{ width: 24, height: 24 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-md">
        <Link to="/questions" style={{ flex: 1 }}>
          <button className="btn btn-ghost btn-lg btn-block">题库管理</button>
        </Link>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={start}>START GAME</button>
        <Link to="/editor" style={{ flex: 1 }}>
          <button className="btn btn-ghost btn-lg btn-block">地图编辑器</button>
        </Link>
      </div>
    </div>
  )
}
