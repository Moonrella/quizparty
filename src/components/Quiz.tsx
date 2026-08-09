import { useState } from 'react'
import { type Question, type Difficulty } from '../types'
import { getAllThemes } from '../data/themes'

interface ThemePickerProps {
  difficulty: Difficulty
  onSelect: (themeId: string) => void
  playerName: string
  playerColor: string
  enabledThemes?: string[]
}

export function ThemePicker({ difficulty, onSelect, playerName, playerColor, enabledThemes }: ThemePickerProps) {
  const themes = enabledThemes
    ? getAllThemes().filter(t => enabledThemes.includes(t.id))
    : getAllThemes()
  return (
    <div className="modal-overlay fade-in">
      <div className="card" style={{ maxWidth: 600, width: '100%', padding: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
            <span style={{
              fontWeight: 800, color: playerColor, fontSize: '0.9rem',
              letterSpacing: '0.05em',
            }}>{playerName.toUpperCase()}</span>
            <span className="badge">ROUND</span>
          </div>

          {/* Big difficulty number */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{
              fontSize: '6rem', fontWeight: 900, color: 'var(--accent)',
              lineHeight: 1, letterSpacing: '-0.05em',
            }}>{difficulty}</span>
          </div>

          <p style={{
            textAlign: 'center', fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            SELECT A CATEGORY
          </p>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Theme grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 24 }}>
          {themes.map(t => (
            <button key={t.id} onClick={() => onSelect(t.id)}
              style={{
                padding: '24px 16px', borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)', background: 'var(--surface)',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.background = 'var(--surface2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--surface)'
              }}
            >
              <span style={{
                fontSize: '1rem', fontWeight: 800, color: 'var(--text)',
                letterSpacing: '0.02em',
              }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface QuizModalProps {
  question: Question
  onAnswer: (correct: boolean) => void
  playerName: string
  playerColor: string
}

export function QuizModal({ question, onAnswer, playerName, playerColor }: QuizModalProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const isJudge = question.type === 'judge'
  const theme = getAllThemes().find(t => t.id === question.theme)

  const handleSelect = (i: number) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    setTimeout(() => onAnswer(i === question.correctIndex), 1500)
  }

  return (
    <div className="modal-overlay fade-in">
      <div className="card" style={{ maxWidth: 720, width: '100%', padding: 36 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
          <span style={{ fontWeight: 700, color: playerColor, fontSize: '1.1rem' }}>{playerName}</span>
          <div className="flex gap-xs items-center">
            {isJudge && <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>简答</span>}
            <span className="badge" style={{ fontSize: '0.85rem' }}>{theme?.name} · Lv{question.difficulty}</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 28, lineHeight: 1.6 }}>
          {question.question}
        </h2>

        {/* Choice type */}
        {!isJudge && (
          <>
            <div className="flex flex-col gap-sm">
              {question.options.map((opt, i) => {
                let border = '1.5px solid var(--border)'
                let bg = 'var(--surface)'
                if (revealed) {
                  if (i === question.correctIndex) { bg = 'var(--success)'; border = 'none' }
                  else if (i === selected) { bg = 'var(--danger)'; border = 'none' }
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)} disabled={revealed}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
                      borderRadius: 'var(--radius)', background: bg, border,
                      color: revealed && (i === question.correctIndex || i === selected) ? '#fff' : 'var(--text)',
                      fontSize: '1.1rem', cursor: revealed ? 'default' : 'pointer',
                      textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.15s',
                    }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 'var(--radius)', background: 'var(--surface2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, color: 'var(--text-dim)',
                    }}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div style={{ marginTop: 24, textAlign: 'center', fontWeight: 700, fontSize: '1.2rem',
                color: selected === question.correctIndex ? 'var(--success)' : 'var(--danger)' }}>
                {selected === question.correctIndex ? 'CORRECT' : 'WRONG'}
              </div>
            )}
          </>
        )}

        {/* Judge type: host decides */}
        {isJudge && !revealed && (
          <div className="flex gap-md justify-center" style={{ marginTop: 8 }}>
            <button className="btn btn-success btn-lg" style={{ minWidth: 120 }}
              onClick={() => { setRevealed(true); setTimeout(() => onAnswer(true), 800) }}>
              ✓ CORRECT
            </button>
            <button className="btn btn-danger btn-lg" style={{ minWidth: 120 }}
              onClick={() => { setRevealed(true); setTimeout(() => onAnswer(false), 800) }}>
              ✗ WRONG
            </button>
          </div>
        )}
        {isJudge && revealed && (
          <div style={{ marginTop: 16, textAlign: 'center', fontWeight: 700, color: 'var(--text-dim)' }}>
            主持人已判定
          </div>
        )}
      </div>
    </div>
  )
}
