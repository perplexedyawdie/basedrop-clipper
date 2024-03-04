import { useState, useEffect } from 'react'

import './App.css'

function App() {
  const [pageUrl, setPageUrl] = useState<string>("")
  useEffect(() => {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })
    .then((tabs) => {
      if (tabs.length > 0 && tabs[0]?.url) {
        setPageUrl(tabs[0].url)
      }
    })
    .catch((error) => {
      console.error(error)
    })
  
    return () => {
      
    }
  }, [])
  

  // const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex justify-center items-center space-y-4">
        
        <p>{pageUrl}</p>
      </div>
    </>
  )
}

export default App
