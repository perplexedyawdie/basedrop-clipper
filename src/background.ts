import { gmeta } from "./utils/gmeta"

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

  
chrome.runtime.onMessage.addListener(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    function (request, _sender, sendResponse: any): boolean {
        if (request.action == "getMetatags") {
            chrome.tabs.sendMessage(request.tabId, { action: "getPageSource" })
                .then((pageSrc) => {
                    console.log("page src background")
                    console.log(pageSrc)
                    const value = gmeta(pageSrc.source)
                    if (!value.error && value.meta) {
                        console.log(value.meta)
                        sendResponse({
                            data: value.meta,
                            error: null
                        })
                    } else {
                        throw value.error
                    }
                })
                .catch((error) => {
                    console.error(error)
                    sendResponse({
                        data: null,
                        error: error
                    })
                })
        }
        return true
    }
)