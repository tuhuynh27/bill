import './App.css'

import { useState } from 'react'
import Select from './Select'
import Main from './Main'

function App() {
  const [name, setName] = useState('')

  return (
    <div className="App">
      {name.length === 0 && <Select onChange={setName} />}
      {name.length > 0 && <Main name={name} />}
    </div>
  );
}

export default App
