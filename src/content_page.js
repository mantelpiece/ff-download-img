const MSG_CONTEXT_MENU_ON_IMAGE = "contextMenuOnImage"

export const extractCollection = (url) => {
    const urlParts = (new URL(url.replace(/\/$/, ""))).pathname.split("/")
    console.debug("url parts", urlParts)

    let namePrefix = ""
    if (urlParts.length > 1) {
        const page = urlParts.pop()
        console.debug("Page", page)
        if (page !== "") {
            const pageId = (page.match(/[0-9]+/) || []).pop()
            if (pageId) {
                namePrefix = `c${pageId.padStart(3, '0')}_`
            } else {
                namePrefix = `${page}_`
            }
            console.log("Name prefix", namePrefix)
        }
    }
};

const prettifyFilename = (imageUrl, pageUrl) => {
    // const { imageUrl, pageUrl } = imageData
    console.debug("Page url", pageUrl)

    const fileName = (new URL(imageUrl).pathname).split("/").pop()
    console.debug("Cleaned filename", fileName)
    let [ name, ext ] = fileName.split(".")
    console.debug(`File name: ${name}.${ext}`)



    const numberMatch = name.match(/[0-9]+(.*[0-9]+)?/)
    if (numberMatch) {
        return `${namePrefix}${numberMatch[0].padStart(3, '0')}.${ext}`
    } else {
        return `${namePrefix}${fileName}`
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

