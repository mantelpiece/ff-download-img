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

const processContextMenuOnImage = (lastImage, data) => {
    if (lastImage && lastImage.imageUrl === data.imageUrl) {
        return Promise.resolve();
    }

    lastImage = {
        ...data,
    }
    console.debug({ ...lastImage, message: "Updating context menu"})

    browser.contextMenus
        .update(MENU_ID_DOWNLOAD_IMAGE, { title: `Download image as ${lastImage.prettyName}` })
        .then(() => browser.contextMenus.refresh())

    return Promise.resolve(lastImage);
}

const processDownloadImage = (lastImage) => {
    console.log("last ", lastImage)
    if (!lastImage) return Promise.reject("No image selected")

    const { imageUrl: url, prettyName: filename } = lastImage

    const downloading = browser.downloads.download({
        filename,
        url,
    });

    return downloading
}

const initialise = () => {
    let lastImage = null

    const menuId = createContextItem()
    console.log("Created menu ", menuId)

    browser.runtime.onMessage.addListener((data) => {
        switch (data.type) {
            case MSG_CONTEXT_MENU_ON_IMAGE:
                return processContextMenuOnImage(lastImage, data)
                    .then((res) => lastImage = res)

            case MSG_DOWNLOAD_IMAGE:
                return processDownloadImage(lastImage)

            default:
                console.debug(`Nope: ${data}`)
        }
    });
}

initialise()

