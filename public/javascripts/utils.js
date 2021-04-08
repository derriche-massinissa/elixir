"use strict";

// Find elements position in parent
function indexInParent ( element ) {
    let idx = 0,
        el = element;
    while (el = el.previousElementSibling)
        idx++;
    return idx;
}

// Initialize the virtual objects' parents
function setParents ( boardsData ) {
    // Boards do not have parents
    for (let board of boardsData) {
        // Lists
        for (let list of board.lists) {
            list.parent = board;
            // Cards
            for (let card of list.cards) {
                card.parent = list;
                // Checklists
                for (let checklist of card.content.checklists) {
                    checklist.parent = card;
                    // Items
                    for (let item of checklist.items) {
                        item.parent = checklist;
                    }
                }
                // Attachments
                for (let attachment of card.content.attachments) {
                    attachment.parent = card;
                }
            }
        }
    }
}

// Takes an integer representing bytes and returns a human readable size
function formatByteSize ( size ) {
    let i = -1,
        byteUnits = [ "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ],
        sizeInBytes = size;
    do {
        sizeInBytes /= 1024;
        i++;
    } while (sizeInBytes > 1024);

    return Math.max(sizeInBytes, 0.1).toFixed(2) + byteUnits[i];
}

// Return the luminance of a given hex color
function getLuminanceHex (color) {
    // Get the rgb values
    let colorHex = color.substring(1),   // Strip the '#'
        colorRGB = parseInt( colorHex, 16 ),  // Convert to decimal
        colorR = (colorRGB >> 16) & 0xff,     // Extract the red
        colorG = (colorRGB >> 8) & 0xff,      // Extract the green
        colorB = (colorRGB >> 0) & 0xff;      // Extract the blue

    // Luminance (per ITU-R BT.709)
    // Light: luminance > 128
    // Dark: luminance < 128
    let luminance = 0.2126 * colorR + 0.7152 * colorG + 0.0722 * colorB;

    return luminance;
}

// Background of the current board
function updateBackground (board) {
    if (board === null || board.closed) {
        $("#base").style.backgroundColor = "#fff";
        $("#base").style.backgroundImage = "url(\"null\")";

        // Favicon
        setFavicon( "default" );

        return;
    }

    if (board.background.type === "color") {
        $("#base").style.backgroundColor = board.background.value;
        $("#base").style.backgroundImage = "url(\"null\")";
        $("kb-header").lighten();
        // Favicon
        setFavicon("color", board.background.value);
    } else if (board.background.type === "image") {
        $("#base").style.backgroundImage = "url(" + board.background.value + ")";
        $("kb-header").darken();
        // Favicon
        setFavicon("image", board.background.value);
    }
}

// UI Title
async function updateTitle () {
    $("kb-header").title = await getData("board-title");
    document.title = `${await getData("board-title")} | Elixir`;
}

// UI Description
function updateDescription () {
    $("kb-header").description = getData("board-description");
}

// Switch board
function switchToBoard (board) {
    currentBoard = boardsData.indexOf(board);
    if (currentBoard === -1) currentBoard = null;
    setupBoard( board );
}

// Format attachment creation time
function getAttachmentTime ( timestamp ) {
    let timeStr = "",
        createDate = new Date( timestamp ),
        monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
        year = createDate.getFullYear(),
        month = monthNames[ createDate.getMonth() ],
        day = createDate.getDate(),
        hours = createDate.getHours(),
        minutes = ((createDate.getMinutes()).toString()).padStart(2, '0');

    if ( (new Date(Date.now()).getFullYear()) === year ) {
        // If same year, do not show the year
        timeStr = `Added ${month} ${day} at ${hours}:${minutes}`;
    } else {
        // If different year, show the year
        timeStr = `Added ${month} ${day} ${year} at ${hours}:${minutes}`;
    }

    return timeStr;
}
