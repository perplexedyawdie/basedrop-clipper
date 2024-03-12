import { fetchContentType } from "./utils/fetchContentType";
import { gmeta } from "./utils/gmeta"

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));


chrome.runtime.onMessage.addListener(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    function (request, _sender, sendResponse: any): boolean {
        switch (request.action) {
            case "getMetatags": {
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
                break;
            }
            case "getContentType": {
                fetchContentType(request.url)
                .then((value) => {
                    if (value.data) {
                        sendResponse({
                            contentType: value.data
                        })
                    } else {
                        sendResponse({
                            contentType: null
                        })
                    }
                })
                .catch((error) => {
                    console.error(error)
                    sendResponse({
                        contentType: null
                    })
                })
                .finally(() => {
                    return true
                })
                break;
            }
            default:
                break;
        }

        return true
    }
)