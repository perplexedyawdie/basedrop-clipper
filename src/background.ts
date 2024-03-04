import { gmeta } from "./utils/gmeta"

chrome.runtime.onMessage.addListener(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (request, _sender, sendResponse: any): boolean {
        console.log("request url: ", request.url)
        gmeta(request.url, false)
        .then((value) => {
            console.log(value)
            if (!value.error && value.meta) {
                sendResponse({
                    data: value.meta,
                    error: null
                })
            }
        })
        .catch((error) => {
            console.error(error)
            sendResponse({
                data: null,
                error: error
            })
        })
        return true;
    }
)