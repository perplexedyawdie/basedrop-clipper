import { useState, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { Result, MetaTags } from './utils/gmeta';
import InspoBoard from './components/InspoBoard';
import AuthContext from './context/AuthContext';
import axios from 'axios';
import { z } from "zod";


interface ColourOption {
  value: string;
  label: string;
}

interface BookmarkItem {
  metaTag: MetaTags;
  tags: string[];
  simplifiedVersion: string;

}
function App() {
  const [status, setStatus] = useState<boolean>(false)
  const [token, setToken] = useState<string>("")
  const [tableId, setTableId] = useState<number | undefined>()

 //TODO Save auth method in context
 //TODO allow logout
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleAuth(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    try {
      if (tableId && token !== "") {
        const resp = await axios({
          method: "GET",
          url: `https://api.baserow.io/api/database/fields/table/${tableId}/`,
          headers: {
            Authorization: `Token ${token}`
          }
        })
        console.log("auth data")
        console.log(resp.data)
        //TODO validate schema & handle errors
        if (Array.isArray(resp.data) && resp.data.length == 2) {
          setStatus(true)
          await chrome.storage.local.set({
            token
          })
          await chrome.storage.local.set({
            tableId
          })
          console.log("tokens persisted")
        }
       }
    } catch (error) {
      console.error(error)
    }

  }

  function handleTableIdInput(event: React.ChangeEvent<HTMLInputElement>): void {
    try {
      const id = parseInt(event.target.value)
      setTableId(id)
    } catch (error) {
      
    }
  }

  // const [pageUrl, setPageUrl] = useState<string>("")
  // const [pageMetadata, setPageMetadata] = useState<MetaTags>()
  // const [bookmarkItem, setBookmarkItem] = useState<BookmarkItem>()
  // const [metaTitle, setMetaTitle] = useState<string | undefined>("")
  // const [metaDesc, setMetaDesc] = useState<string | undefined>("")
  // const [metaImgUrl, setMetaImgUrl] = useState<string | undefined>("")
  // const [test, settest] = useState<string>()
  // useEffect(() => {
  //   chrome.tabs.query({
  //     active: true,
  //     lastFocusedWindow: true,
  //   })
  //     .then((tabs) => {
  //       if (tabs.length > 0 && tabs[0]?.url && tabs[0].id) {
  //         setPageUrl(tabs[0].url)
  //         return chrome.runtime.sendMessage({ url: tabs[0].url, action: "getMetatags", tabId: tabs[0].id })
  //       }
  //     })
  //     .then((result) => {
  //       console.log("result")
  //       //TODO handle time taken to return data (spinner)
  //       if (result) {
  //         setMetaTitle(result?.data?.title)
  //         setMetaDesc(result?.data?.description)
  //         setMetaImgUrl(result?.data?.image)
  //         console.log("result")
  //         console.log(result?.data)
  //         settest(JSON.stringify(result))
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error)
  //     })

  //   return () => {

  //   }
  // }, [])
  // const promiseOptions = (inputValue: string) =>
  //   new Promise<ColourOption[]>((resolve) => {
  //     setTimeout(() => {
  //       const opts: ColourOption[] = [
  //         {
  //           label: "hello",
  //           value: "world"
  //         }
  //       ]
  //       resolve(opts);
  //     }, 1000);
  //   });

  // useEffect(() => {
  //   if (pageUrl !== "") {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     chrome.runtime.sendMessage({ url: pageUrl, action: "getMetatags" })
  //       .then((msg) => {
  //         console.log(msg)
  //       })
  //       .catch((error) => console.error(error))
  //   }
  //   return () => {

  //   }
  // }, [pageUrl])



  // const [count, setCount] = useState(0)

  return (
    <AuthContext.Provider value={{
      status,
      setStatus,
      token,
      setToken,
      setTableId,
      tableId
    }}>
      <div className="flex justify-center items-center space-y-4 min-w-fit">
        <Tabs className="space-y-8 w-full flex flex-col justify-center items-center">
          <TabList className="tabs tabs-boxed">
            <Tab
              selectedClassName="tab-active"
              className="tab">
              InspoBoard
            </Tab>
            <Tab
              selectedClassName="tab-active"
              className="tab">
              Settings
            </Tab>
          </TabList>
          <TabPanel>

            <InspoBoard />


          </TabPanel>
          <TabPanel>
            <h1 className="card-title">Bring Your Own Database</h1>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Table ID</span>
              </div>
              <input type="number" value={tableId} onChange={handleTableIdInput} className="input input-bordered w-full max-w-xs" />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Baserow Token:</span>
              </div>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                <input type="password" className="grow w-full max-w-xs" value={token} onChange={(e) => setToken(e.target.value)} />
              </label>
              <div className="w-full flex justify-center items-center mt-8">
                <button onClick={handleAuth} className="btn btn-primary">Log In</button>
              </div>
            </label>
            <div className="divider">OR</div>
            <button className="btn btn-outline btn-primary btn-block">Login with Basedrop</button>
          </TabPanel>
        </Tabs>

      </div>
    </AuthContext.Provider>
  )
}

export default App
