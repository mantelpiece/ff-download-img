const MSG_CONTEXT_MENU_ON_IMAGE = "contextMenuOnImage"
const MSG_DOWNLOAD_IMAGE = "downloadImage"

const pretifyFilename = (imageUrl, pageUrl) => {
    // const { imageUrl, pageUrl } = imageData
    console.debug("Page url", pageUrl)

    const urlParts = (new URL(pageUrl.replace(/\/$/, ""))).pathname.split("/")
    console.debug("url parts", urlParts)

    const fileName = (new URL(imageUrl).pathname).split("/").pop()
    console.debug("Cleaned filename", fileName)
    let [ name, ext ] = fileName.split(".")
    console.debug(`File name: ${name}.${ext}`)


    let namePrefix = ""
    if (urlParts.length > 1) {
        const page = urlParts.pop()
        console.log("Page", page)
        if (page !== "") {
            // Strip out the page name if it appears in the file name
            name = name.replace(page, "")

            const pageId = (page.match(/[0-9]+/) || []).pop()
            if (pageId) {
                namePrefix = `c${pageId.padStart(3, '0')}_`
            } else {
                namePrefix = `${page}_`
            }
            console.log("Name prefix", namePrefix)
        }
    }

    const numberMatch = name.match(/[0-9]+(.*[0-9]+)?/)
    if (numberMatch) {
        return `${namePrefix}${numberMatch[0].padStart(3, '0')}.${ext}`
    } else {
        return `${namePrefix}${fileName}`
    }
}

const initialise = () => {
    document.body.addEventListener('contextmenu', (ev) => {
        console.debug("Context menu click")
        let { clientX: x, clientY: y } = ev;
        lastRightClickCoords = { x, y };
        console.debug("Context menu coords", {x, y})

        elements = document.elementsFromPoint(x, y)
        console.debug("# elements under cursor: ", elements.length)

        let imageAtContextMenu = null
        for (el of elements) {
            if (el.tagName.toLowerCase() === "img") {
                imageAtContextMenu = el
            }
        }

        if (imageAtContextMenu !== null) {
            console.debug("Image element under cursor", imageAtContextMenu)
            try {
                imageUrl = imageAtContextMenu.src
                pageUrl = document.location.href

                browser.runtime.sendMessage({
                    type: MSG_CONTEXT_MENU_ON_IMAGE,
                    coords: {x, y},
                    imageUrl: imageAtContextMenu.src,
                    prettyName: pretifyFilename(imageUrl, pageUrl),
                })
            } catch (e) { console.log(e) }
        }
    });
};

initialise()

