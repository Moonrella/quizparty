import { useState } from 'react'
import { type Question, type Difficulty } from '../types'
import { getAllThemes, loadEnabledThemes } from '../data/themes'

interface Props {
  questions: Question[]
  usedQuestionIds: string[]
  interactive: boolean
  onSelectQuestion?: (themeId: string, difficulty: Difficulty) => void
}

export default function QuestionGrid({ questions, usedQuestionIds, interactive, onSelectQuestion }: Props) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const enabledIds = loadEnabledThemes()
  const allThemes = getAllThemes()
  const themes = enabledIds.length === 0
    ? allThemes
    : allThemes.filter(t => enabledIds.includes(t.id))

  const getAvailable = (theme: string, diff: Difficulty): number => {
    return questions.filter(q =>
      q.theme === theme && q.difficulty === diff && !usedQuestionIds.includes(q.id)
    ).length
  }

  return (
    <div style={{
      width: 240, flexShrink: 0, padding: '16px 12px',
      borderLeft: '1px solid var(--border)', background: 'var(--surface)',
      overflowY: 'auto',
    }}>
      <p className="label" style={{ marginBottom: 8, textAlign: 'center' }}>QUESTION POOL</p>
      {interactive && (
        <p style={{ fontSize: '0.7rem', color: 'var(--accent)', textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
          点击格子选题
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `auto repeat(6, 1fr)`,
          gap: 4, minWidth: 190,
        }}>
          <div />
          {([1,2,3,4,5,6] as Difficulty[]).map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '0.65rem', fontWeight: 800,
              color: 'var(--text-dim)', padding: '4px 0',
            }}>Lv{d}</div>
          ))}

          {themes.map(t => (
            <>
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center',
                padding: '4px 6px 4px 0', fontSize: '0.75rem',
                fontWeight: 600, whiteSpace: 'nowrap',
              }}>{t.name}</div>
              {([1,2,3,4,5,6] as Difficulty[]).map(d => {
                const count = getAvailable(t.id, d)
                const cellKey = `${t.id}-${d}`
                const hasQuestions = count > 0
                const canClick = interactive && hasQuestions
                const isHovered = hoveredCell === cellKey

                return (
                  <button key={cellKey}
                    disabled={!canClick}
                    onClick={() => canClick && onSelectQuestion?.(t.id, d)}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      height: 32, borderRadius: 4,
                      border: canClick && isHovered ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: canClick && isHovered ? 'var(--accent)' : hasQuestions ? 'var(--surface2)' : 'transparent',
                      color: canClick && isHovered ? '#fff' : hasQuestions ? 'var(--text)' : 'var(--text-dim)',
                      cursor: canClick ? 'pointer' : 'default',
                      fontSize: '0.75rem', fontWeight: 700,
                      opacity: hasQuestions ? 1 : 0.3,
                      fontFamily: 'var(--font)',
                      transition: 'all 0.1s',
                      padding: 0,
                    }}>
                    {count}
                  </button>
                )
              })}
            </>
          ))}
        </div>
      </div>

      <div className="divider" />
      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        已用 {usedQuestionIds.length} / {questions.length} 题
      </p>
    </div>
  )
}
