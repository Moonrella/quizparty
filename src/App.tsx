import { Routes, Route } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import QuestionBank from './pages/QuestionBank'
import MapEditor from './pages/MapEditor'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="/editor" element={<MapEditor />} />
      </Routes>
    </div>
  )
}
