import { useState } from 'react'
import { type Question, type Player } from '../types'
import { getAllThemes } from '../data/themes'

interface Props {
  question: Question | null
  players: Player[]
  onBuzzIn: (playerIndex: number, question: Question) => void
  onNoAnswer: (question: Question) => void
}

export default function FortuneMode({ question, players, onBuzzIn, onNoAnswer }: Props) {
  const [showAnswer, setShowAnswer] = useState(false)
  const themes = getAllThemes()

  if (!question) return null

  const buzz = (pi: number) => {
    setShowAnswer(false)
    onBuzzIn(pi, question)
  }

  const skip = () => {
    setShowAnswer(true)
    setTimeout(() => {
      setShowAnswer(false)
      onNoAnswer(question)
    }, 3000)
  }

  return (
    <div className="modal-overlay fade-in" style={{ zIndex: 200 }}>
      <div className="card" style={{ maxWidth: 560, width: '100%', padding: 36 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <span className="badge">
            {themes.find(t => t.id === question.theme)?.name} · Lv{question.difficulty}
          </span>
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.6, marginBottom: 20 }}>
          {question.question}
        </h2>

        {question.type !== 'judge' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 24 }}>
            {question.options.map((opt, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: showAnswer && i === question.correctIndex ? 'var(--success)' : 'var(--surface2)',
                color: showAnswer && i === question.correctIndex ? '#fff' : 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem',
                transition: 'all 0.3s',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 'var(--radius)',
                  background: showAnswer && i === question.correctIndex ? '#fff' : 'var(--accent)',
                  color: showAnswer && i === question.correctIndex ? 'var(--success)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.7rem', flexShrink: 0,
                }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </div>
            ))}
          </div>
        )}

        <div className="divider" />

        {showAnswer ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
              ✓ 正确答案已公布
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 4 }}>
              自动跳过，轮到下一位玩家选题...
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 700, textAlign: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              WHO GOT IT?
            </p>
            <div className="flex gap-sm flex-wrap justify-center" style={{ marginBottom: 16 }}>
              {players.map((p, i) => (
                <button key={p.id} onClick={() => buzz(i)}
                  className="btn btn-sm" style={{ background: p.color, color: '#fff' }}>
                  {p.name}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={skip}>无人答对 · 公布答案</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
