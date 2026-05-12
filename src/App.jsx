import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Home from './components/Home'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Home/>
    </div>
  )
}

export default App
