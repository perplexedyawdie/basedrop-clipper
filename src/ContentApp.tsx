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
    // Check if the drag includes files
    if (dt.types.includes('Files')) {
      const file = dt.files[0];
      console.log(dt)
      const type = dt.getData('text/uri-list')
      console.log(type)

      if (type !== "") {
        chrome.runtime.sendMessage({
          action: "getContentType",
          url: type
        })
        .then((data) => {
          console.log("content type")
          console.log(data)
        })
        .catch(console.error)
      }


      // if (fileType.startsWith('image/')) {
      //   console.log('Dragging an image file.');
      // } else if (fileType.startsWith('audio/')) {
      //   console.log('Dragging an audio file.');
      // } else if (fileType.startsWith('video/')) {
      //   console.log('Dragging a video file.');
      // } else if (fileType.startsWith('application/')) {
      //   console.log('Dragging a document.');
      // }
    } else if (dt.types.includes('text/plain')) {
      console.log(dt)
      const textType = dt.getData('text/plain')

      if (textType.startsWith('http://') || textType.startsWith('https://')) {
        console.log('Dragging a well-formed URL.');
      } else {
        console.log('Dragging generic text.');
      }

    }
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