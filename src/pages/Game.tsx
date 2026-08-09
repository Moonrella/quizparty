import { useState, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Board from '../components/Board'
import { ThemePicker, QuizModal } from '../components/Quiz'
import Wheel from '../components/Wheel'
import FortuneMode from '../components/FortuneMode'
import HostPanel from '../components/HostPanel'
import QuestionGrid from '../components/QuestionGrid'
import { type GameState, type Question, type Difficulty } from '../types'
import {
  loadGameState, saveGameState, nextTurn, movePlayer,
  addCoins, addScore, buyProperty, payToll, markQuestionUsed,
  getCoinReward, checkWinner, getRanking, clearGameState,
  rollDice, hostMovePlayer, hostSetCoins,
} from '../stores/gameStore'
import { loadQuestions, getAvailableQuestion } from '../stores/questionStore'
import { getBoardPreset } from '../data/boardPresets'
import { loadEnabledThemes } from '../data/themes'

type Modal = null | 'theme-picker' | 'quiz' | 'wheel' | 'fortune' | 'host' | 'event' | 'buy-property' | 'finished'

export default function Game() {
  const navigate = useNavigate()
  const [state, setState] = useState<GameState | null>(loadGameState())
  const [questions] = useState<Question[]>(loadQuestions())
  const [modal, setModal] = useState<Modal>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [diceDisplay, setDiceDisplay] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [eventMsg, setEventMsg] = useState('')
  const [showHost, setShowHost] = useState(false)
  const [_fortuneExpanded, setFortuneExpanded] = useState(false)
  const [fortuneActive, setFortuneActive] = useState(false)
  const [_fortuneRound, setFortuneRound] = useState(0)
  const [fortuneToast, setFortuneToast] = useState<string | null>(null)
  const [fortuneQuestion, setFortuneQuestion] = useState<Question | null>(null)
  const [wrongGlow, setWrongGlow] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const wheelStepsRef = useRef<number | null>(null)

  const showFortuneToast = (msg: string) => {
    setFortuneToast(msg)
    setTimeout(() => setFortuneToast(null), 2000)
  }

  // Fortune sidebar: pick question from the grid
  const handleFortunePick = useCallback((themeId: string, difficulty: Difficulty) => {
    if (!fortuneActive) return
    const s = stateRef.current
    if (!s) return
    const q = getAvailableQuestion(questions, s.usedQuestionIds, themeId, difficulty)
    if (!q) {
      setEventMsg('该分类没有可用题目，跳过回合')
      skipTileRef.current = true
      update(nextTurn(s))
      setModal('event')
      return
    }
    wheelStepsRef.current = difficulty
    update(markQuestionUsed(s, q.id))
    setFortuneQuestion(q)
  }, [questions, fortuneActive])

  // ref always points to latest state, fixing stale closure bugs
  const stateRef = useRef(state)
  stateRef.current = state
  const skipTileRef = useRef(false)

  if (!state) {
    return (
      <div className="page flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
        <h2 style={{ marginBottom: 16 }}>没有进行中的游戏</h2>
        <Link to="/" className="btn btn-primary">返回大厅</Link>
      </div>
    )
  }

  const preset = getBoardPreset(state.boardPresetId)
  const currentPlayer = state.players[state.currentPlayerIndex]
  const sorted = getRanking(state)

  const update = (s: GameState) => { setState(s); stateRef.current = s; saveGameState(s) }

  const handleRoll = () => {
    const cur = stateRef.current
    if (!cur || rolling || cur.phase !== 'rolling') return
    setRolling(true)
    let count = 0
    const interval = setInterval(() => {
      setDiceDisplay(Math.floor(Math.random() * 6) + 1)
      count++
      if (count > 8) {
        clearInterval(interval)
        const s = stateRef.current!
        const result = rollDice(s)
        setDiceDisplay(result.value)
        setRolling(false)
        update(result.state)
        setModal('theme-picker')
      }
    }, 80)
  }

  const handleThemeSelect = useCallback((themeId: string) => {
    const s = stateRef.current
    if (!s || !s.diceValue) return
    const q = getAvailableQuestion(questions, s.usedQuestionIds, themeId, s.diceValue)
    if (!q) {
      setEventMsg('该分类没有可用题目，跳过回合')
      skipTileRef.current = true
      update(nextTurn(s))
      setModal('event')
      return
    }
    update(markQuestionUsed(s, q.id))
    setCurrentQuestion(q)
    setModal('quiz')
  }, [questions])

  // Shared tile effect checker - called after any movement animation
  const checkTileEffect = useCallback((playerIndex: number) => {
    const s = stateRef.current!
    const pos = s.players[playerIndex].position
    const tile = s.board[pos]

    // Check win condition first
    const winner = checkWinner(s)
    if (winner) {
      update({ ...s, phase: 'finished' })
      setModal('finished')
      return
    }

    if (!tile || tile.type === 'safe' || tile.type === 'empty') {
      skipTileRef.current = true
      update(nextTurn(s))
      return
    }

    switch (tile.type) {
      case 'wheel':
        setModal('wheel')
        break

      case 'fortune':
        if (fortuneActive) {
          // End fortune mode
          setFortuneActive(false)
          setFortuneExpanded(false)
          showFortuneToast('◆ 抢答模式 结束')
        } else {
          // Start fortune mode
          setFortuneActive(true)
          setFortuneExpanded(true)
          setFortuneRound(r => r + 1)
          showFortuneToast('◆ 抢答模式 开启')
        }
        skipTileRef.current = true
        update(nextTurn(s))
        break

      case 'property': {
        if (tile.ownerId) {
          const oi = s.players.findIndex(p => p.id === tile.ownerId)
          if (oi >= 0 && oi !== playerIndex) {
            const tolled = payToll(s, playerIndex, oi, pos)
            setEventMsg(`🏠 ${s.players[oi].name} 的地产！支付 ${tile.toll} 🪙`)
            skipTileRef.current = true
            update(nextTurn(tolled))
            setModal('event')
            return
          }
        } else if (s.players[playerIndex].coins >= (tile.propertyPrice || 0)) {
          setModal('buy-property')
          return
        } else {
          setEventMsg(`🏠 金币不足（需 ${tile.propertyPrice} 🪙）`)
          skipTileRef.current = true
          update(nextTurn(s))
          setModal('event')
          return
        }
        skipTileRef.current = true
        update(nextTurn(s))
        break
      }

      case 'treasure': {
        const r = 25 + Math.floor(Math.random() * 31)
        const rewarded = addCoins(s, playerIndex, r)
        setEventMsg(`💰 宝箱！+${r} 🪙`)
        skipTileRef.current = true
        update(nextTurn(rewarded))
        setModal('event')
        return
      }
    }
  }, [fortuneActive])

  const handleQuizAnswer = useCallback((correct: boolean) => {
    const s = stateRef.current
    if (!s) return
    setCurrentQuestion(null)

    // Determine steps: wheel question uses wheelStepsRef, normal uses diceValue
    const steps = wheelStepsRef.current ?? s.diceValue
    wheelStepsRef.current = null
    if (!steps) return

    if (correct) {
      const reward = getCoinReward(steps as Difficulty)
      let updated = addCoins(s, s.currentPlayerIndex, reward)
      updated = addScore(updated, s.currentPlayerIndex, 1)
      update(updated)

      // Animate step-by-step movement
      setAnimating(true)
      const pi = s.currentPlayerIndex
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const st = stateRef.current!
        const moved = movePlayer(st, pi, 1)
        update(moved)
        if (currentStep >= steps) {
          clearInterval(interval)
          setAnimating(false)
          setTimeout(() => checkTileEffect(pi), 200)
        }
      }, 250)
    } else {
      // Wrong: red glow then advance
      setWrongGlow(s.currentPlayerIndex)
      setTimeout(() => {
        setWrongGlow(null)
        skipTileRef.current = true
        const st = stateRef.current!
        update(nextTurn(st))
      }, 600)
    }
  }, [checkTileEffect])

  const handleEventContinue = useCallback(() => {
    setModal(null)
    // Tile effects are handled by checkTileEffect; this just closes the popup
    if (skipTileRef.current) {
      skipTileRef.current = false
      return
    }
    // If somehow no skip was set, advance turn
    const s = stateRef.current
    if (s) {
      skipTileRef.current = true
      update(nextTurn(s))
    }
  }, [])

  const handleWheelResult = useCallback((themeId: string, difficulty: number) => {
    const s = stateRef.current
    if (!s) return
    const q = getAvailableQuestion(questions, s.usedQuestionIds, themeId, difficulty as Difficulty)
    if (!q) {
      setEventMsg('该主题没有可用题目了！')
      setModal('event')
      return
    }
    wheelStepsRef.current = difficulty
    update(markQuestionUsed(s, q.id))
    setCurrentQuestion(q)
    setModal('quiz')
  }, [questions])

  const handleFortuneBuzzIn = useCallback((playerIndex: number, question: Question) => {
    const s = stateRef.current
    if (!s) return
    let updated = markQuestionUsed(s, question.id)
    const reward = getCoinReward(question.difficulty)
    updated = addCoins(updated, playerIndex, reward)
    updated = addScore(updated, playerIndex, 1)
    update(updated)

    // Animate step-by-step movement, then check tile
    setAnimating(true)
    const steps = question.difficulty
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const st = stateRef.current!
      const moved = movePlayer(st, playerIndex, 1)
      update(moved)
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimating(false)
        setTimeout(() => checkTileEffect(playerIndex), 200)
      }
    }, 250)
  }, [checkTileEffect])

  const handleBuyProperty = () => {
    const s = stateRef.current!
    const pos = s.players[s.currentPlayerIndex].position
    const bought = buyProperty(s, s.currentPlayerIndex, pos)
    setEventMsg(`🏠 购买成功！花费 ${s.board[pos]?.propertyPrice} 🪙`)
    skipTileRef.current = true
    update(nextTurn(bought))
    setModal('event')
  }

  const handleSkipBuy = () => {
    const s = stateRef.current!
    skipTileRef.current = true
    update(nextTurn(s))
    setEventMsg('跳过购买')
    setModal('event')
  }

  const handleEndGame = () => { clearGameState(); navigate('/') }

  const onHostMove = (pi: number, pos: number) => update(hostMovePlayer(stateRef.current!, pi, pos))
  const onHostCoins = (pi: number, coins: number) => update(hostSetCoins(stateRef.current!, pi, coins))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left sidebar: Real-time ranking */}
      <div style={{
        width: 240, flexShrink: 0, padding: '16px 12px',
        borderRight: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <p className="label" style={{ marginBottom: 12, textAlign: 'center' }}>RANKING</p>
        <div className="flex flex-col gap-xs">
          {sorted.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 'var(--radius)',
              background: p.id === currentPlayer.id ? 'var(--surface2)' : 'transparent',
              border: p.id === currentPlayer.id ? `2px solid ${p.color}` : '2px solid transparent',
              transition: 'all 0.4s ease',
            }}>
              <span style={{ fontWeight: 900, color: p.color, fontSize: '0.85rem', width: 20, textAlign: 'center' }}>
                {i + 1}
              </span>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>
                {p.coins}
              </div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div style={{ textAlign: 'center' }}>
          <p className="label" style={{ marginBottom: 4 }}>ROUND</p>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{state.round}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}> / {state.maxRounds}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="page fade-in" style={{ paddingBottom: 120, flex: 1 }}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleEndGame}>END</button>
          <div className="flex items-center gap-sm">
            {fortuneActive && <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>◆ 抢答模式</span>}
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHost(true)}>HOST</button>
            <Link to="/questions" className="btn btn-ghost btn-sm">Q</Link>
          </div>
        </div>

      {/* Turn order bar */}
      <div className="flex gap-sm" style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {state.players.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 'var(--radius)',
            background: i === state.currentPlayerIndex ? 'var(--surface2)' : 'var(--surface)',
            border: i === state.currentPlayerIndex ? `2px solid ${p.color}` : '1px solid var(--border)',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.name}</span>
            {i === state.currentPlayerIndex && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, animation: 'pulse 1.5s infinite' }} />
            )}
          </div>
        ))}
      </div>

      {/* Board */}
      <Board board={state.board} players={state.players}
        currentPlayerIndex={state.currentPlayerIndex} rows={preset.rows} cols={preset.cols}
        wrongGlow={wrongGlow} />

      {/* Dice area */}
      <div className="card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-sm">
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: currentPlayer.color }} />
          <span style={{ fontWeight: 700, color: currentPlayer.color }}>{currentPlayer.name}</span>
          {fortuneActive && <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>◆ 抢答模式</span>}
        </div>
        <div className="flex items-center gap-md">
          <span style={{ fontSize: '2.2rem', lineHeight: 1, fontWeight: 900, color: 'var(--accent)' }}>
            {diceDisplay || '—'}
          </span>
          <button className="btn btn-primary" onClick={handleRoll}
            disabled={rolling || state.phase !== 'rolling' || animating || fortuneActive}>
            {rolling ? '...' : fortuneActive ? 'LOCKED' : 'ROLL'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {modal === 'theme-picker' && state.diceValue && (
        <ThemePicker difficulty={state.diceValue} onSelect={handleThemeSelect}
          playerName={currentPlayer.name} playerColor={currentPlayer.color}
          enabledThemes={loadEnabledThemes()} />
      )}
      {modal === 'quiz' && currentQuestion && (
        <QuizModal question={currentQuestion} onAnswer={handleQuizAnswer}
          playerName={currentPlayer.name} playerColor={currentPlayer.color} />
      )}
      {modal === 'wheel' && <Wheel onResult={handleWheelResult} />}
      {fortuneActive && (
        <FortuneMode
          question={fortuneQuestion}
          players={state.players}
          onBuzzIn={(pi, q) => {
            setFortuneQuestion(null)
            handleFortuneBuzzIn(pi, q)
          }}
          onNoAnswer={() => {
            setFortuneQuestion(null)
            const s = stateRef.current!
            skipTileRef.current = true
            update(nextTurn(s))
          }}
        />
      )}

      {modal === 'buy-property' && (
        <div className="modal-overlay fade-in">
          <div className="card" style={{ textAlign: 'center', maxWidth: 360 }}>
            <p className="label">PROPERTY</p>
            <h3 style={{ marginBottom: 12, fontWeight: 800 }}>购买地产？</h3>
            <p style={{ marginBottom: 8 }}>
              价格: <strong style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>
                {state.board[state.players[state.currentPlayerIndex].position]?.propertyPrice}
              </strong> coins
            </p>
            <p style={{ color: 'var(--text-dim)', marginBottom: 20, fontSize: '0.85rem' }}>
              过路费 {state.board[state.players[state.currentPlayerIndex].position]?.toll} coins
            </p>
            <div className="flex gap-sm justify-center">
              <button className="btn btn-success" onClick={handleBuyProperty}>BUY</button>
              <button className="btn btn-ghost" onClick={handleSkipBuy}>SKIP</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'event' && (() => {
        const isCorrect = eventMsg.startsWith('✅')
        const isWrong = eventMsg.startsWith('❌')
        const color = isCorrect ? 'var(--success)' : isWrong ? 'var(--danger)' : 'var(--accent)'
        const icon = isCorrect ? '✓' : isWrong ? '✗' : '●'
        return (
          <div className="modal-overlay fade-in">
            <div className="card" style={{
              textAlign: 'center', maxWidth: 420, width: '100%', padding: 40,
            }}>
              {/* Icon */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: color + '18', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '2rem', fontWeight: 900, color, lineHeight: 1,
                }}>{icon}</span>
              </div>
              {/* Message */}
              <p style={{
                fontSize: '1.1rem', fontWeight: 700, marginBottom: 28,
                lineHeight: 1.6, color: 'var(--text)',
              }}>{eventMsg}</p>
              {/* Button */}
              <button className="btn btn-primary btn-lg" onClick={handleEventContinue}
                style={{ minWidth: 140 }}>NEXT</button>
            </div>
          </div>
        )
      })()}

      {modal === 'finished' && (
        <div className="modal-overlay fade-in">
          <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
            <p className="label">GAME OVER</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: sorted[0]?.color, verticalAlign: 'middle', marginRight: 8 }} />
              {sorted[0]?.name}
            </h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>WINNER</p>
            <div className="flex flex-col gap-xs" style={{ marginBottom: 24 }}>
              {sorted.map((p, i) => (
                <div key={p.id} className="flex justify-between" style={{
                  padding: '10px 16px', borderRadius: 'var(--radius)',
                  background: i === 0 ? 'var(--surface2)' : 'transparent',
                  borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i + 1}. <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.color, display: 'inline-block' }} /> {p.name}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dim)' }}>{p.score}pts · {p.coins}c</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleEndGame}>PLAY AGAIN</button>
          </div>
        </div>
      )}

      {showHost && (
        <HostPanel state={state} onMovePlayer={onHostMove} onSetCoins={onHostCoins}
          onClose={() => setShowHost(false)} />
      )}

      {/* Fortune toast */}
      {fortuneToast && (
        <div style={{
          position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 300, pointerEvents: 'none',
          animation: 'toastFade 2s ease-in-out forwards',
        }}>
          <p style={{
            fontSize: '3rem', fontWeight: 900, color: 'var(--accent)',
            letterSpacing: '0.05em', textShadow: '0 2px 16px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
          }}>{fortuneToast}</p>
        </div>
      )}
    </div>

    {/* Right sidebar: Question pool (sibling of page, not inside it) */}
    <QuestionGrid
      questions={questions}
      usedQuestionIds={state.usedQuestionIds}
      interactive={fortuneActive}
      onSelectQuestion={handleFortunePick}
    />
    </div>
  )
}
