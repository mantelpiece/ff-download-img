const MSG_CONTEXT_MENU_ON_IMAGE = "contextMenuOnImage"

const extractCollection = (url) => {
    const urlParts = (new URL(url)).pathname.replace(/\/$/, "").split("/")
    console.debug("url parts", urlParts)

    if (urlParts.length <= 1) {
        return ""
    } else {
        const page = urlParts.pop()
        console.debug("Page", page)

        const pageId = (page.match(/[0-9]+/) || []).pop()
        console.debug("Page id", pageId)
        if (pageId) {
            return `c${pageId.padStart(3, '0')}`
        } else {
            return `${page}`
        }
    }
};

const extractSimpleFilename = (url) => {
    const fileName = (new URL(url).pathname).split("/").pop()

    // Default extension to jpg if the filename does not include one
    let [ basename, extension="jpg" ] = fileName.split(".")

    const basenameId = (basename.match(/[0-9]+.*$/) || []).pop()
    if (basenameId) {
        return `${basenameId.padStart(3, '0')}.${extension}`
    } else {
        return fileName
    }
}

const handleContextMenu = (event) => {
    let { clientX: x, clientY: y } = event;

    const elementsUnderContext = document.elementsFromPoint(x, y)
    const imageAtContextMenu = elementsUnderContext.find(el => el.tagName.toLowerCase() === "img")


    if (!imageAtContextMenu) {
        // TODO: Send message to clear
        console.debug("No image under cursor")
    } else {
        console.debug("Image element under cursor", imageAtContextMenu)
        try {
            const pageUrl = document.location.href
            const imageUrl = imageAtContextMenu.src

            const collection = extractCollection(pageUrl)
            const simpleFilename = extractSimpleFilename(imageUrl)
            const prettyName = collection !== "" ? `${collection}_${simpleFilename}` : simpleFilename

            const message = {
                type: MSG_CONTEXT_MENU_ON_IMAGE,
                coords: {x, y},
                imageUrl: imageAtContextMenu.src,
                prettyName,
            }
            console.debug("Sending message", message)
            return browser.runtime
                .sendMessage(message)
                .then((res) => console.log(res))

        } catch (e) {
            return Promise.reject(e)
        }
    }
}

const initialise = () => {
    document.body
        .addEventListener('contextmenu', handleContextMenu)
}

initialise()

