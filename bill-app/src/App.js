import './App.css'

import { Routes, Route } from 'react-router-dom'
import Select from './Select'
import Main from './Main'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Select/>} />
        <Route path="/:name" element={<Main />} />
      </Routes>
    </div>
  );
}

export default App
