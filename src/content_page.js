const MSG_CONTEXT_MENU_ON_IMAGE = "contextMenuOnImage"

export const extractCollection = (url) => {
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

export const extractSimpleFilename = (imageUrl) => {
    const fileName = (new URL(imageUrl).pathname).split("/").pop()

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
    console.debug("Context menu click at coords", {x, y})

    const elements = document.elementsFromPoint(x, y)
    console.debug("# elements under cursor: ", elements.length)

    let imageAtContextMenu = null
    for (const el of elements) {
        if (el.tagName.toLowerCase() === "img") {
            imageAtContextMenu = el
        }
    }

    if (imageAtContextMenu !== null) {
        console.debug("Image element under cursor", imageAtContextMenu)
        try {
            const imageUrl = imageAtContextMenu.src
            const pageUrl = document.location.href

            browser.runtime.sendMessage({
                type: MSG_CONTEXT_MENU_ON_IMAGE,
                coords: {x, y},
                imageUrl: imageAtContextMenu.src,
                prettyName: prettifyFilename(imageUrl, pageUrl),
            })
        } catch (e) {
            console.debug(e)
        }
    }
}

const initialise = () => {
    document.body
        .addEventListener('contextmenu', handleContextMenu)
}

initialise()

