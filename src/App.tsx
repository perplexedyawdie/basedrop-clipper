import { useState } from 'react'
import './App.css'
import InspoBoard from './components/InspoBoard';
import AuthContext, { BlockData } from './context/AuthContext';

function App() {

  const [blockData, setBlockData] = useState<BlockData[]>([])

  return (
    <AuthContext.Provider value={{
      blockData, 
      setBlockData
    }}>
      <div className="flex justify-center items-center space-y-4 min-w-fit">
      <InspoBoard />
      </div>
    </AuthContext.Provider>
  )
}

export default App
