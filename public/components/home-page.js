"use strict";

class KbHomePage extends HTMLElement {
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

    // Initialization
    connectedCallback() {
        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;
        
        // Header
        $("kb-header").noBoardLayout();

        // Fill with starred boards
        for (let board of boardsData) {
            if (!board.starred || board.closed) continue;
            this.shadowRoot.querySelector("#starred-boards").classList.remove("hide");
            let boardItem = document.createElement("kb-home-boards-item");
            //boardItem.setAttribute("slot", "starred-boards");
            boardItem.data = board;
            this.shadowRoot.querySelector("#starred-boards-content").appendChild( boardItem );
        }
        // Fill with boards
        for (let board of boardsData) {
            if (board.closed) continue;
            let boardItem = document.createElement("kb-home-boards-item");
            //boardItem.setAttribute("slot", "all-boards");
            boardItem.data = board;
            this.shadowRoot.querySelector("#all-boards-content").appendChild( boardItem );
        }
    }

    // Methods

    // Getters
    get html() {
        return `
<div id="container">
    <div id="boards">
        <div id="starred-boards" class="boards-section hide">
            <div class="boards-section-header">
                <span class="icon-lg mdi mdi-star-outline"></span>
                <span class="section-name">Starred Boards</span>
            </div>
            <div id="starred-boards-content" class="boards-section-content">
            </div>
        </div>
        <div id="all-boards" class="boards-section">
            <div class="boards-section-header">
                <span class="icon icon-lg mdi mdi-view-dashboard"></span>
                <span class="section-name">All Boards</span>
            </div>
            <div id="all-boards-content" class="boards-section-content">
            </div>
        </div>
    </div>
</div>
        `;
    }

    get css() {
        return `
:host {
    flex-grow: 1;
    height: 100%;
    display: block;
}
#container {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    padding: 40px 0 16px;
}
#boards {
    height: 100%;
    max-width: 825px;
    min-width: 825px;
    /*min-width: 290px;*/
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
}
.boards-section {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
}
.boards-section-header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin: 24px 0;
}
.boards-section-header > .icon {
    color: var(--c-main-weak);
}
.boards-section-header > .icon::before {
    display: block;
}
.boards-section-header > .section-name {
    line-height: 24px;
    font-size: 16px;
    font-weight: 500;
    font-family: "Noto Sans Bold", arial;
    margin-left: 4px;
}
.boards-section-content {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 0;
    display: flex;
    flex-flow: row wrap;
    overflow: hidden;
    width: 100%;
}
/*::slotted(kb-home-boards-item) {*/
.boards-section-content > kb-home-boards-item {
    margin-right: 2%;
    margin-bottom: 2%;
    width: 23.5%;
}
/*::slotted(kb-home-boards-item[slot="all-boards"]:nth-of-type(4n)),
::slotted(kb-home-boards-item[slot="starred-boards"]:nth-of-type(4n)) {*/
.boards-section-content :nth-child(4n) {
    margin-right: 0%;
}
        `;
    }
}

customElements.define( "kb-home-page", KbHomePage );

// Boards List Item
class KbHomeBoardsItem extends HTMLElement {
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

        // Display board info
        if (this.virtual) {
            // Title
            this.shadowRoot.querySelector("#title").textContent = this.virtual.title;
            // Background
            switch (this.virtual.background.type) {
                case "color":
                    this.shadowRoot.querySelector("#board-link").style.backgroundColor = this.virtual.background.value;
                    break;
                case "image":
                    this.shadowRoot.querySelector("#board-link").style.backgroundImage = `url(${this.virtual.background.value})`;
                    break;
            }
        }

        // Events
        this.shadowRoot.querySelector("#board-link").onclick = () => { return false; };
        this.shadowRoot.querySelector("#board-link").addEventListener( "click", () => { this.switchBoard() } );
    }

    // Methods
    switchBoard() {
        switchToBoard( this.virtual );
    }

    // Setters
    set data(board) {
        this.virtual = board;
    }

    // Getters
    get html() {
        return `
<a id="board-link" href="/b/${this.virtual.id}/${this.virtual.title.toLowerCase().replace(/ /gi, '-')}">
    <div id="title-container">
        <div id="title">Board Title</div>
    </div>
</a>
        `;
    }
    get css() {
        return `
:host {
    box-sizing: border-box;
    border-radius: var(--border-radius);
    position: relative;
    /* margin: 0 4px 4px 0; */
    display: block;
}
#board-link {
    display: flex;
    font-weight: 700;
    height: 96px;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
    position: relative;
    text-decoration: none;
    user-select: none;
    border-radius: var(--border-radius);
    background-image: "url(\"null\")";
    background-size: cover;
    background-position: 50%;
}
#board-link::before {
    content: "";
    opacity: .15;
    background: var(--c-black);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
#board-link:hover::before {
    opacity: .25;
}
#title-container {
    display: flex;
    position: relative;
    flex: 1;
    width: 100%;
    /* padding: 9px 0 9px 10px; */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#title {
    display: block;
    padding-right: 12px;
    overflow: hidden;
    /* text-overflow: ellipsis; */
    white-space: nowrap;
    color: var(--c-white);
    font-size: 16px;
    font-weight: 700;
    word-wrap: break-word;
}
        `;
    }
}

customElements.define( "kb-home-boards-item", KbHomeBoardsItem );
