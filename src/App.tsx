import { useState, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { Result, MetaTags } from './utils/gmeta';
import InspoBoard from './components/InspoBoard';

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
  const [pageUrl, setPageUrl] = useState<string>("")
  const [pageMetadata, setPageMetadata] = useState<MetaTags>()
  const [bookmarkItem, setBookmarkItem] = useState<BookmarkItem>()
  const [metaTitle, setMetaTitle] = useState<string | undefined>("")
  const [metaDesc, setMetaDesc] = useState<string | undefined>("")
  const [metaImgUrl, setMetaImgUrl] = useState<string | undefined>("")
  const [test, settest] = useState<string>()
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
    <>
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
            <p>
              world
            </p>
          </TabPanel>
        </Tabs>

      </div>
    </>
  )
}

export default App
