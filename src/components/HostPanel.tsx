import { useState } from 'react'
import { type GameState } from '../types'

interface Props {
  state: GameState
  onMovePlayer: (pi: number, pos: number) => void
  onSetCoins: (pi: number, coins: number) => void
  onClose: () => void
}

export default function HostPanel({ state, onMovePlayer, onSetCoins, onClose }: Props) {
  const [sel, setSel] = useState(0)
  const p = state.players[sel]

  return (
    <div className="modal-overlay fade-in">
      <div className="card" style={{ maxWidth: 460, width: '100%' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
          <div>
            <p className="label">HOST CONTROL</p>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>主持人控制台</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>CLOSE</button>
        </div>

        <div className="flex gap-sm flex-wrap" style={{ marginBottom: 20 }}>
          {state.players.map((pl, i) => (
            <button key={pl.id} onClick={() => setSel(i)}
              className={`btn btn-sm ${sel === i ? 'btn-primary' : 'btn-ghost'}`}
              style={sel === i ? { background: pl.color } : {}}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: sel === i ? '#fff' : pl.color, display: 'inline-block' }} /> {pl.name}
            </button>
          ))}
        </div>

        {p && (
          <>
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
              <div className="flex justify-between" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.color, display: 'inline-block' }} /> {p.name}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{p.coins} coins</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <span>Position: {p.position + 1}/{state.board.length}</span>
                <span>Score: {p.score} · Properties: {p.properties.length}</span>
              </div>
            </div>

            <label>MOVE TO TILE</label>
            <div className="flex gap-sm items-center" style={{ marginBottom: 20 }}>
              <input type="range" min={0} max={state.board.length - 1} value={p.position}
                onChange={e => onMovePlayer(sel, Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{p.position + 1}</span>
            </div>

            <label>COINS</label>
            <div className="flex gap-sm" style={{ marginBottom: 20 }}>
              <input className="input" type="number" value={p.coins}
                onChange={e => onSetCoins(sel, Number(e.target.value))} style={{ flex: 1 }} />
              <button className="btn btn-success btn-sm" onClick={() => onSetCoins(sel, p.coins + 50)}>+50</button>
              <button className="btn btn-danger btn-sm" onClick={() => onSetCoins(sel, Math.max(0, p.coins - 50))}>-50</button>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-ghost btn-sm" onClick={() => onMovePlayer(sel, state.board.length - 1)}>→ END</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onMovePlayer(sel, 0)}>→ START</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
