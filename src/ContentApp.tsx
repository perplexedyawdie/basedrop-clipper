import React, { useEffect } from 'react'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPageSourceListener = function (request: any, _sender: chrome.runtime.MessageSender, sendResponse: any) {
  if (request.action === "getPageSource") {
    console.log(request.action)
    console.log("getting page src")
    let filteredContent = '';
    // Select and concatenate meta and link tags
    document.querySelectorAll('head > meta').forEach(element => {
      filteredContent += element.outerHTML;
    });
    // console.log(pageSource)
    sendResponse({ source: filteredContent });
  }
  return undefined
}

const injectDragStartEvt = (event: DragEvent) => {
  
  const dt = event.dataTransfer;
  if (dt) {
    const nodeType = 'mediaDisplay'; // Determine or set your nodeType here
    dt.setData('application/reactflow', nodeType);
    dt.effectAllowed = 'move';
  }
}

function ContentApp() {
  useEffect(() => {
    window.document.addEventListener('dragstart', injectDragStartEvt)
    chrome.runtime.onMessage.addListener(getPageSourceListener);
    return () => {
      chrome.runtime.onMessage.removeListener(getPageSourceListener);
      window.document.removeEventListener('dragstart', injectDragStartEvt)
    }
  }, [])

  return (
    <></>
  )
}

export default ContentApp