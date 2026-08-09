import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { type Question, type Difficulty, type QuestionType } from '../types'
import { getAllThemes, addCustomTheme, removeCustomTheme, hideTheme, THEMES, loadEnabledThemes, saveEnabledThemes } from '../data/themes'
import {
  loadQuestions, addQuestion, updateQuestion, deleteQuestion,
  importQuestions, exportQuestions, saveQuestions,
} from '../stores/questionStore'
import { presetQuestions } from '../data/presetQuestions'

const EMPTY: Omit<Question, 'id'> = {
  theme: '', difficulty: 1 as Difficulty, type: 'choice',
  question: '', options: ['', '', '', ''], correctIndex: 0,
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(loadQuestions())
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Question, 'id'>>(EMPTY)
  const [filterTheme, setFilterTheme] = useState('')
  const [filterDiff, setFilterDiff] = useState<number>(0)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [newThemeName, setNewThemeName] = useState('')
  const [allThemes, setAllThemes] = useState(getAllThemes())
  const [enabledThemes, setEnabledThemes] = useState<Set<string>>(new Set(loadEnabledThemes()))
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = questions.filter(q =>
    (!filterTheme || q.theme === filterTheme) &&
    (!filterDiff || q.difficulty === filterDiff)
  )

  const resetForm = () => { setForm({ ...EMPTY }); setEditing(null) }

  const handleSave = () => {
    if (!form.question.trim() || !form.theme) return
    if (form.type === 'choice' && (form.options.length < 2 || form.options.some(o => !o.trim()))) return
    if (editing) {
      setQuestions(updateQuestion(questions, editing, form))
    } else {
      setQuestions(addQuestion(questions, form))
    }
    resetForm()
  }

  const handleEdit = (q: Question) => {
    setForm({ theme: q.theme, difficulty: q.difficulty, type: q.type || 'choice', question: q.question, options: [...q.options], correctIndex: q.correctIndex })
    setEditing(q.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除？')) setQuestions(deleteQuestion(questions, id))
  }

  const handleExport = () => {
    const blob = new Blob([exportQuestions(questions)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'quizparty_questions.json'
    a.click()
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try { setQuestions(importQuestions(questions, reader.result as string)); alert('导入成功！') }
      catch { alert('格式错误') }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleTextImport = () => {
    try { setQuestions(importQuestions(questions, importText)); setImportText(''); setShowImport(false); alert('导入成功！') }
    catch { alert('格式错误') }
  }

  const handleAddTheme = () => {
    if (!newThemeName.trim()) return
    addCustomTheme(newThemeName.trim())
    const updated = getAllThemes()
    setAllThemes(updated)
    setNewThemeName('')
  }

  const handleRemoveTheme = (id: string) => {
    if (!confirm('删除此主题？该主题下的题目不会被删除，但需要重新归类。')) return
    const isCustom = !THEMES.find(dt => dt.id === id)
    if (isCustom) {
      removeCustomTheme(id)
    } else {
      hideTheme(id)
    }
    setAllThemes(getAllThemes())
    toggleTheme(id, false)
  }

  const toggleTheme = (id: string, forceOn?: boolean) => {
    setEnabledThemes(prev => {
      const next = new Set(prev)
      if (forceOn === true || (!forceOn && !next.has(id))) {
        next.add(id)
      } else {
        next.delete(id)
      }
      saveEnabledThemes(Array.from(next))
      return next
    })
  }

  const setQuestionType = (type: QuestionType) => {
    setForm(f => ({
      ...f, type,
      options: type === 'judge' ? [] : f.options.length < 2 ? ['', ''] : f.options,
      correctIndex: 0,
    }))
  }

  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }))

  const removeOption = (i: number) => {
    setForm(f => {
      const opts = f.options.filter((_, idx) => idx !== i)
      const ci = f.correctIndex >= opts.length ? 0 : f.correctIndex > i ? f.correctIndex - 1 : f.correctIndex
      return { ...f, options: opts, correctIndex: ci }
    })
  }

  const counts = allThemes.map(t => ({
    ...t,
    count: questions.filter(q => q.theme === t.id).length,
  }))

  return (
    <div className="page fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
        <Link to="/" className="btn btn-ghost btn-sm">← BACK</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>题库管理</h1>
        <span style={{ color: 'var(--text-dim)' }}>{questions.length} 题</span>
      </div>

      {/* Theme management */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="label">THEMES</p>
        <div className="flex gap-sm flex-wrap" style={{ marginBottom: 12 }}>
          {counts.map(t => {
            const isOn = enabledThemes.has(t.id)
            return (
              <div key={t.id} style={{ position: 'relative' }}
                onMouseEnter={e => { const btn = e.currentTarget.querySelector('.theme-del') as HTMLElement; if (btn) btn.style.opacity = '1' }}
                onMouseLeave={e => { const btn = e.currentTarget.querySelector('.theme-del') as HTMLElement; if (btn) btn.style.opacity = '0' }}>
                <button className={`btn btn-sm ${isOn ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => toggleTheme(t.id)} style={{ fontWeight: 700 }}>
                  {t.name} ({t.count})
                </button>
                <button className="theme-del" onClick={() => handleRemoveTheme(t.id)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 16, height: 16, borderRadius: '50%', border: 'none',
                    background: 'var(--danger)', color: '#fff', fontSize: '0.55rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.15s',
                    lineHeight: 1, padding: 0,
                  }}>×</button>
              </div>
            )
          })}
        </div>
        <div className="flex gap-sm items-center">
          <input className="input" value={newThemeName} onChange={e => setNewThemeName(e.target.value)}
            placeholder="新主题名称" style={{ maxWidth: 180 }}
            onKeyDown={e => e.key === 'Enter' && handleAddTheme()} />
          <button className="btn btn-ghost btn-sm" onClick={handleAddTheme}>+ NEW THEME</button>
        </div>
      </div>

      {/* Editor */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 800 }}>{editing ? 'EDIT' : 'NEW QUESTION'}</h3>
        <div className="flex flex-col gap-md">

          {/* Row 1: Theme + Difficulty + Type */}
          <div className="flex gap-sm flex-wrap">
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>THEME</label>
              <select className="select" value={form.theme}
                onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}>
                <option value="">Select</option>
                {allThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 180 }}>
              <label>DIFFICULTY</label>
              <div className="flex gap-xs">
                {([1,2,3,4,5,6] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                    className={`btn btn-sm ${form.difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '6px 10px', fontWeight: 800 }}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{ minWidth: 160 }}>
              <label>TYPE</label>
              <div className="flex gap-xs">
                <button className={`btn btn-sm ${form.type === 'choice' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setQuestionType('choice')}>选择题</button>
                <button className={`btn btn-sm ${form.type === 'judge' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setQuestionType('judge')}>简答题</button>
              </div>
            </div>
          </div>

          {/* Question text */}
          <div>
            <label>QUESTION</label>
            <input className="input" value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="输入题目" />
          </div>

          {/* Options (choice type only) */}
          {form.type === 'choice' && (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <label style={{ margin: 0 }}>OPTIONS (click letter to set correct answer)</label>
                <button className="btn btn-ghost btn-sm" onClick={addOption}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}>+ ADD</button>
              </div>
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-sm items-center" style={{ marginBottom: 6 }}>
                  <button onClick={() => setForm(f => ({ ...f, correctIndex: i }))}
                    style={{
                      width: 32, height: 32, borderRadius: 'var(--radius)', flexShrink: 0,
                      border: `2px solid ${form.correctIndex === i ? 'var(--success)' : 'var(--border)'}`,
                      background: form.correctIndex === i ? 'var(--success)' : 'transparent',
                      color: form.correctIndex === i ? '#fff' : 'var(--text-dim)',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
                    }}>{String.fromCharCode(65 + i)}</button>
                  <input className="input" value={opt}
                    onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(f => ({ ...f, options: o })) }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(i)}
                      style={{
                        width: 28, height: 28, borderRadius: 'var(--radius)', border: 'none',
                        background: 'var(--danger)', color: '#fff', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                      }}>×</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Judge type hint */}
          {form.type === 'judge' && (
            <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              简答题由主持人判断对错。出题时只需填写题目，游戏中由主持人点击"对"或"错"。
            </div>
          )}

          <div className="flex gap-sm">
            <button className="btn btn-success" onClick={handleSave}>{editing ? 'SAVE' : 'ADD'}</button>
            {editing && <button className="btn btn-ghost" onClick={resetForm}>CANCEL</button>}
          </div>
        </div>
      </div>

      {/* Import / Export */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flex gap-sm flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>EXPORT</button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
            IMPORT FILE
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(!showImport)}>PASTE IMPORT</button>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (confirm('加载预设题库？（54道题，不会覆盖现有题目）')) {
              const newQs = presetQuestions.map(q => ({ ...q, id: crypto.randomUUID() }))
              const updated = [...questions, ...newQs]
              setQuestions(updated)
              saveQuestions(updated)
            }
          }}>LOAD PRESET</button>
          <button className="btn btn-danger btn-sm" onClick={() => {
            if (confirm('确定删除所有题目？此操作不可恢复。')) {
              setQuestions([])
              saveQuestions([])
            }
          }}>DELETE ALL</button>
        </div>
        {showImport && (
          <div style={{ marginTop: 12 }}>
            <textarea className="textarea" rows={5} value={importText}
              onChange={e => setImportText(e.target.value)} placeholder="Paste JSON array..." />
            <button className="btn btn-success btn-sm" style={{ marginTop: 8 }} onClick={handleTextImport}>IMPORT</button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-sm flex-wrap" style={{ marginBottom: 8 }}>
        <button className={`btn btn-sm ${!filterTheme ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterTheme('')}>ALL</button>
        {allThemes.map(t => (
          <button key={t.id} className={`btn btn-sm ${filterTheme === t.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterTheme(t.id)}>{t.name}</button>
        ))}
      </div>
      <div className="flex gap-sm flex-wrap" style={{ marginBottom: 16 }}>
        <button className={`btn btn-sm ${!filterDiff ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterDiff(0)}>ALL</button>
        {([1,2,3,4,5,6] as Difficulty[]).map(d => (
          <button key={d} className={`btn btn-sm ${filterDiff === d ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterDiff(d)}>Lv{d}</button>
        ))}
      </div>

      {/* Question list */}
      <div className="flex flex-col gap-sm">
        {filtered.map((q, i) => {
          const theme = allThemes.find(t => t.id === q.theme)
          const isJudge = q.type === 'judge'
          return (
            <div key={q.id} className="card" style={{ padding: 14 }}>
              <div className="flex justify-between items-center">
                <div className="flex gap-sm items-center">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    #{i + 1} · {theme?.name || '?'} · Lv{q.difficulty}
                  </span>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>
                    {isJudge ? '简答' : `选择 · ${q.options.length}项`}
                  </span>
                </div>
                <div className="flex gap-sm">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(q)}>EDIT</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>×</button>
                </div>
              </div>
              <p style={{ fontWeight: 600, margin: '8px 0' }}>{q.question}</p>
              {!isJudge && (
                <div className="flex gap-sm flex-wrap">
                  {q.options.map((opt, j) => (
                    <span key={j} style={{
                      padding: '3px 10px', borderRadius: 100, fontSize: '0.8rem',
                      background: j === q.correctIndex ? 'var(--success)' : 'var(--surface2)',
                      color: j === q.correctIndex ? '#fff' : 'var(--text-dim)',
                    }}>{String.fromCharCode(65 + j)}. {opt}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
