"use strict";

class KbBoardMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow( {mode: "open"} );

        // CSS
        this.styleIndex = document.createElement( "link" );
        this.styleIndex.setAttribute( "rel", "stylesheet" );
        this.styleIndex.setAttribute( "type", "text/css" );
        this.styleIndex.setAttribute( "href", "/stylesheets/index.css" );
        // Icons
        this.styleIcons = document.createElement( "link" );
        this.styleIcons.setAttribute( "rel", "stylesheet" );
        this.styleIcons.setAttribute( "type", "text/css" );
        this.styleIcons.setAttribute( "media", "all" );
        this.styleIcons.setAttribute( "href", "/stylesheets/materialdesignicons.css" );
        // Component Style
        this.styleComponent = document.createElement( "style" );
        this.styleComponent.textContent = this.css;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Default content
        this.showDefault();

        // Events
        this.shadowRoot.querySelector("#header-close-button").onclick = () => { this.close() };
        this.shadowRoot.querySelector("#header-back-button").onclick = () => { this.showDefault() };
    }

    // Methods
    open() {
        this.showDefault();
        this.shadowRoot.querySelector("#container").style.width = "340px";
    }
    close() {
        this.shadowRoot.querySelector("#container").style.width = "";
        $("kb-header").menuClosed();
        this.innerHTML = "";
    }
    showDefault() {
        // Title
        this.shadowRoot.querySelector("#header-title").innerText = "Menu";

        // Default content
        this.shadowRoot.querySelector("main").innerHTML = "";
        this.shadowRoot.querySelector("main").appendChild(
            this.shadowRoot.querySelector("#templates > .default").content.cloneNode(true)
        );
        this.innerHTML = "";

        // Hide back button
        this.shadowRoot.querySelector("#header-back-button").style.transform = "";

        // Events
        this.shadowRoot.querySelector("#default-background").onclick = () => { this.showBackgroundType() };
        this.shadowRoot.querySelector("#default-card-archive").onclick = () => { this.showCardArchive() };
        this.shadowRoot.querySelector("#default-list-archive").onclick = () => { this.showListArchive() };
        this.shadowRoot.querySelector("#default-close-board").onclick = () => { this.askCloseBoard() };
    }
    async showCardArchive() {
        // Title
        this.shadowRoot.querySelector("#header-title").innerText = "Card Archive";

        // Show back button
        this.shadowRoot.querySelector("#header-back-button").style.transform = "translateX(0)";

        // Set content
        this.shadowRoot.querySelector("main").innerHTML = "";
        this.shadowRoot.querySelector("main").appendChild(
            this.shadowRoot.querySelector("#templates > .card-archive").content.cloneNode(true)
        );

        // Load lists
        let board = $("#board").virtual;
        let archivedCards = await getData( "archived-cards", board );
        for (let card of archivedCards) {
            let cardElement = document.createElement( "kb-card" );
            cardElement.data = card;
            cardElement.setAttribute( "slot", "archived-card" );
            this.appendChild( cardElement );
        };
    }
    showListArchive() {
        // Title
        this.shadowRoot.querySelector("#header-title").innerText = "List Archive";

        // Show back button
        this.shadowRoot.querySelector("#header-back-button").style.transform = "translateX(0)";

        // Set content
        this.shadowRoot.querySelector("main").innerHTML = "";
        this.shadowRoot.querySelector("main").appendChild(
            this.shadowRoot.querySelector("#templates > .list-archive").content.cloneNode(true)
        );

        // Load lists
        let board = boardsData[currentBoard];
        for (let list of board.lists) {
            // Only add archived lists
            if (!list.archived) continue;
            let listItem = document.createElement("kb-list-archived");
            listItem.data = list;
            listItem.setAttribute("slot", "archived-list");
            this.appendChild( listItem );
        };
    }
    showBackgroundType() {
        // Title
        this.shadowRoot.querySelector("#header-title").innerText = "Change Background";

        // Show back button
        this.shadowRoot.querySelector("#header-back-button").style.transform = "translateX(0)";
        this.shadowRoot.querySelector("#header-back-button").onclick = () => { this.showDefault() };

        // Set content
        this.shadowRoot.querySelector("main").innerHTML = "";
        this.shadowRoot.querySelector("main").appendChild(
            this.shadowRoot.querySelector("#templates > .background-types").content.cloneNode(true)
        );

        // Events
        this.shadowRoot.querySelector("#background-type-colors").onclick = () => { this.showColorList() };
        this.shadowRoot.querySelector("#background-image-file").onchange = (e) => { this.setImageBackground(e) };
    }
    showColorList() {
        // Title
        this.shadowRoot.querySelector("#header-title").innerText = "Colors";

        // Edit back button
        this.shadowRoot.querySelector("#header-back-button").onclick = () => { this.showBackgroundType() };

        // Set content
        this.shadowRoot.querySelector("main").innerHTML = "";
        this.shadowRoot.querySelector("main").appendChild(
            this.shadowRoot.querySelector("#templates > .background-colors").content.cloneNode(true)
        );

        // Fill with color buttons
        let colorList = this.shadowRoot.querySelector("#background-colors-list");
        for (let color of accentColors) {
            let colorItem = _("li"),
                colorButton = _("button");

            colorButton.style.backgroundColor = color;
            colorButton.onclick = (e) => { this.selectColor(e) };

            colorItem.appendChild( colorButton );
            colorList.appendChild( colorItem );
        }
    }
    async selectColor(e) {
        let color = e.target.style.backgroundColor;
        await setData("board-background-color", boardsData[currentBoard], color);
    }
    async setImageBackground(e) {
        let image = e.target.files[0];
        await setData("board-background-image", boardsData[currentBoard], image);
    }
    askCloseBoard() {
        let popoverElement = $("kb-popover-board-close");
        if (popoverElement === null) {
            let popover = document.createElement( "kb-popover-board-close" );
            popover.type = "close";
            popover.data = boardsData[currentBoard];
            $("#base").appendChild( popover );
        } else {
            popoverElement.close();
        }
    }

    // Getters
    get html() {
        return `
<div id="container">
    <div id="content">
        <header>
            <div id="header-content">
                <button id="header-back-button">
                    <div class="icon-lg mdi mdi-chevron-left"></div>
                </button>
                <div id="header-title">Menu</div>
                <button id="header-close-button">
                    <div class="icon-lg mdi mdi-close"></div>
                </button>
            </div>
            <hr id="header-divider">
        </header>
        <main>
        </main>
    </div>
</div>
<div id="templates" class="hide">
    <!-- Default Menu -->
    <template class="default">
        <button class="default-button button-link">
	    <span class="icon-sm mdi mdi-information-outline"></span>
	    About This Board
        </button>
        <button id="default-background" class="default-button button-link">
	    <span class="icon-sm mdi mdi-image"></span>
	    Change Background
        </button>
        <button id="default-list-archive" class="default-button button-link">
	    <span class="icon-sm mdi mdi-view-sequential"></span>
	    Archived Lists
        </button>
        <button id="default-card-archive" class="default-button button-link">
	    <span class="icon-sm mdi mdi-card-bulleted"></span>
	    Archived Cards
        </button>
        <button class="default-button button-link">
	    <span class="icon-sm mdi mdi-settings-outline"></span>
	    Settings
        </button>
        <button id="default-close-board" class="default-button button-link">
	    <span class="icon-sm mdi mdi-tab-remove"></span>
	    Close Board
        </button>
    </template>
    <!-- Card Archive -->
    <template class="card-archive">
        <div id="card-archive-container">
            <div id="card-archive-list">
                <slot name="archived-card"></slot>
            </div>
        </div>
    </template>
    <!-- List Archive -->
    <template class="list-archive">
        <div id="list-archive-container">
            <ul id="list-archive-list">
                <slot name="archived-list"></slot>
            </ul>
        </div>
    </template>
    <!-- Background Type -->
    <template class="background-types">
        <div id="background-types">
            <div id="background-type-image" class="background-type">
                <button>
                    <input id="background-image-file" class="invisible" type="file">
                    <label id="background-image-label" for="background-image-file"></label>
                </button>
                <span>Image</span>
            </div>
            <div id="background-type-colors" class="background-type">
                <button></button>
                <span>Color</span>
            </div>
        </div>
    </template>
    <!-- Background Selection: Colors -->
    <template class="background-colors">
        <div id="background-colors-container">
            <ul id="background-colors-list">
            </ul>
        </div>
    </template>
</div>
        `;
    }

    get css() {
        return `
:host {
    /*flex-grow: 1;
    min-width: 340px;
    max-width: 340px;*/
    height: 100%;
}
#container {
    height: 100%;
    width: 0; /*340px;*/
    overflow: hidden;
    transition: width .12s ease-in;
}
#content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    background-color: var(--c-panel-3);
}
header {
}
#header-content {
    height: 48px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    overflow: hidden;
}
#header-content > button {
    color: var(--c-main-weak);
}
#header-back-button {
    transform: translateX(-48px);
    transition: transform .12s ease-in;
}
#header-title {
    font-size: 16px;
    font-weight: 600;
}
#header-divider {
    margin: 0 12px;
    border: none;
    height: 1px;
    background-color: var(--c-gray-13);
}
main {
    flex-grow: 1;
    padding: 12px;
    overflow-x: hidden;
    overflow-y: auto;
}
.default-button {
    width: 100%;
    text-align: left;
    background-color: transparent;
    font-weight: 600;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 8px;
}
.default-button > span {
    margin-right: 10px;
}
.default-button > span::before {
    display: block;
}

/* Card Archive */
#card-archive-list {
}
::slotted(kb-card[slot="archived-card"]) {
    max-width: 256px;
    margin: 8px auto 16px;
}

/* List Archive */
#list-archive-list {
    padding: 0;
    margin: 0;
}

/* Background Type Selection */
#background-types {
    display: flex;
    flex-flow: row nowrap;
}
.background-type {
    flex-grow: 1;
}
.background-type > button {
    height: 96px;
    width: 100%;
    background-position: 50%;
    background-size: cover;
    border-radius: 8px;
    position: relative;
}
.background-type > button:hover {
    opacity: .7;
}
.background-type > span {
    margin-top: 8px;
    display: block;
    cursor: pointer;
    text-align: center;
}
#background-type-image {
    margin-right: 4px;
}
#background-type-image > button {
    background-image: url("/images/ui/new-board-image-bg.jpg");
}
#background-type-colors {
    margin-left: 4px;
}
#background-type-colors > button {
    background-image: url("/images/ui/new-board-color-bg.jpg");
}
#background-image-label {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: block;
    cursor: pointer;
}

/* Background Color Selection */
#background-colors-list {
    display: flex;
    flex-flow: row wrap;
    padding: 0;
}
#background-colors-list > li {
    width: 50%;
    list-style: none;
    box-sizing: border-box;
    margin-bottom: 8px;
}
#background-colors-list > li:nth-child(odd) {
    padding-right: 4px;
}
#background-colors-list > li:nth-child(even) {
    padding-left: 4px;
}
#background-colors-list > li > button {
    height: 96px;
    width: 100%;
    background-position: 50%;
    background-size: cover;
    border-radius: 8px;
}
#background-colors-list > li > button:hover {
    opacity: .7;
}
        `;
    }
}

customElements.define( "kb-board-menu", KbBoardMenu );
