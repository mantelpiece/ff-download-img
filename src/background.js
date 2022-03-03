const MSG_CONTEXT_MENU_ON_IMAGE = "contextMenuOnImage"
const MSG_DOWNLOAD_IMAGE = "downloadImage"
const MENU_ID_DOWNLOAD_IMAGE = "downloadImage"

const downloadImageMenuItem = {
    id: MENU_ID_DOWNLOAD_IMAGE,
    title: "Download image...",
    type: "normal",
    icons: {
        "48": "./icons/icon_48.png",
        "96": "./icons/icon_96.png"
    },
    onclick(info, tab) {
        console.log("Downloading image under context menu")
        browser.tabs
            .executeScript(tab.id, {
                frameId: info.frameId,
                code: `browser.runtime.sendMessage({ type: "${MSG_DOWNLOAD_IMAGE}" })`
            })
    }
}

const createContextItem = () => {
    try {
        return browser.contextMenus.create(
            downloadImageMenuItem,
        )
    } catch (e) {
        console.log(e)
        console.log("tf")
    }
}

const processContextMenuOnImage = (lastImage, newImage) => {
    if (lastImage && lastImage.imageUrl === newImage.imageUrl) {
        return Promise.resolve(lastImage);
    }

    console.debug({ ...newImage, message: "Updating context menu"})

    browser.contextMenus
        .update(MENU_ID_DOWNLOAD_IMAGE, { title: `Download image as ${newImage.prettyName}` })
        .then(() => browser.contextMenus.refresh())

    return Promise.resolve(newImage);
}


const initialise = () => {
    let lastImage = null

    const menuId = createContextItem()
    console.log("Created menu ", menuId)

    browser.runtime.onMessage.addListener((data, send, sendResponse) => {
        switch (data.type) {
            case MSG_CONTEXT_MENU_ON_IMAGE:
                console.log("Dooo it")
                return processContextMenuOnImage(lastImage, data)
                    .then((res) => { lastImage = res })
                    .then(() => sendResponse("Okay"))

            case MSG_DOWNLOAD_IMAGE:
                if (!lastImage) {
                    const message ="No image selected"
                    console.debug(message)
                    return sendResponse(message)
                }

                console.log("Downloading image", lastImage)
                return browser.downloads
                    .download({
                        filename: lastImage.prettyName,
                        url: lastImage.imageUrl,
                    })
                    .then(() => {}, e => sendResponse(e))

            default:
                console.debug(`Nope: ${data}`)
        }
    });
}

initialise()

