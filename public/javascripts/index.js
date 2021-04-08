"use strict";

// Global variables
let currentBoard = 0,
    boardsData = {};
// Constants
const imageTypes = [ "image/apng", "image/bmp", "image/gif", "image/jpeg", "image/png", "image/webp" ],
    audioTypes = [ "audio/wave", "audio/wav", "audio/x-wav", "audio/x-pn-wav", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", ];

// Setup the board
function setupBoard ( board ) {
    // FIXME: Seriously fix this...
    currentBoard = boardsData.indexOf( board );
    if (currentBoard === -1) currentBoard = null;
    console.warn( "Fix this index based board system: " + currentBoard );

    // Reset board wrapper content
    if ($("kb-board") !== null)
        $("kb-board").clear();
    $("#board-wrapper").innerHTML = "";
    $("kb-header").menuClosed();

    // Show home page
    if (board === null) {
        // Page
        let homePage = _("kb-home-page#board");
        homePage.data = board;
        $("#board-wrapper").appendChild( homePage );

        // Title
        document.title = `Boards | Elixir`;

        // Url
        window.history.pushState("", "", "/");

        // Background
        updateBackground( null );

        return;
    }

    // Board
    let boardElement = _("kb-board#board");
    boardElement.data = board;
    $("#board-wrapper").appendChild( boardElement );

    // Url
    let urlTitle = board.title.toLowerCase().replace(/ /gi, "-");
    window.history.pushState("", "", `/b/${board.id}/${urlTitle}`);

    // Background
    updateBackground( board );

    // Star
    $("kb-header").updateStar();

    // Board's title
    updateTitle();

    // Board's description
    updateDescription();
}

// Loud error notification
window.onerror = () => {
    alert("Error, check the console for more details (Ctrl+Shift+k)");
}

// This is where everything begins
window.onload = async () => {
    // Load and setup the data object
    boardsData = await getFromServerAll();
    setParents( boardsData );

    // Read the url
    let urlSegments = window.location.pathname.split("/").filter(segment => segment !== "");

    if (urlSegments.length === 0) {
        // Home page
        setupBoard( null );
    } else if (urlSegments[0] === "b") {
        // Setup the current board and fill it
        let board = await getData( "board-from-id", urlSegments[1] );
        setupBoard( board );
    } else if (urlSegments[0] === "c") {
        // If url is of a card id, display that card's details
        let board = await getData( "board-from-card-id", urlSegments[1] );
        setupBoard( board );

        if (board === null) return;
        let card = await getData( "card-from-id", urlSegments[1] );
        card.element.click();
    }
}
