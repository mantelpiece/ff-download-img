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
        const { pageUrl, targetElementId, frameId} = info;

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

const initialise = () => {
    const lastContextMenuCoords = { x: 0, y: 0 }
    let lastImage = null

    const menuId = createContextItem()
    console.log("Created menu ", menuId)

    browser.runtime.onMessage.addListener((data, sender) => {
        switch (data.type) {
            case MSG_CONTEXT_MENU_ON_IMAGE:
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

                return Promise.resolve();

            case MSG_DOWNLOAD_IMAGE:
                console.log("last ", lastImage)
                if (!lastImage) return Promise.reject("No image selected")

                const { imageUrl: url, prettyName: filename } = lastImage

                downloading = browser.downloads.download({
                    filename,
                    url,
                });

                return downloading

            default:
                console.debug(`Nope: ${data}`)
        }
    });
}

initialise()

