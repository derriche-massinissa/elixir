"use strict";

// Boards List
class KbBoardsMenu extends HTMLElement {
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

        // Fill starred lists
        boardsData.forEach( board => {
            if (!board.starred) return;
            if (board.closed) return;
            let item = document.createElement("kb-boards-menu-item");
            item.setAttribute( "slot", "starred-board" );
            item.data = board;
            this.appendChild(item);
        });
        // Fill lists
        boardsData.forEach( board => {
            if (board.closed) return;
            let item = document.createElement("kb-boards-menu-item");
            item.setAttribute( "slot", "board" );
            item.data = board;
            this.appendChild(item);
        });

        // Events
        this.shadowRoot.addEventListener( "close-menu", () => { this.closeMenu() } );
        this.shadowRoot.querySelector("#option-create-board").onclick = () => { this.openBoardCreator() };
        this.shadowRoot.querySelector("#option-closed-boards-list").onclick = () => { this.openClosedBoardsWindow() };
    }

    // Methods
    closeMenu() {
        this.remove();
    }
    openBoardCreator() {
        this.closeMenu();
        $("#base").appendChild( document.createElement("kb-board-creator") );
    }
    openClosedBoardsWindow() {
        this.closeMenu();
        $("#base").appendChild( document.createElement("kb-window-boards-archive") );
    }

    // Getters
    get html() {
        return `
<div id="container">
    <div id="content">
        <div id="lists">
            <div id="starred-boards">
                <div class="header">
                    <span>
                        <span class="icon mdi mdi-star-outline"></span>
                        <span class="name">Starred Boards</span>
                    </span>
                </div>
                <div class="list">
                    <div class="content">
                        <slot name="starred-board"></slot>
                    </div>
                </div>
            </div>
            <div id="all-boards">
                <div class="header">
                    <span>
                        <span class="icon mdi mdi-view-dashboard"></span>
                        <span class="name">All Boards</span>
                    </span>
                </div>
                <div class="list">
                    <div class="content">
                        <slot name="board"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div id="options">
            <button id="option-create-board">Create new board…</button>
            <button id="option-closed-boards-list">See closed boards…</button>
        </div>
    </div>
</div>
        `;
    }
    get css() {
        return `
:host {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 44px;
    bottom: auto;
    max-height: calc(100% - 48px);
    z-index: 200;
    width: 280px;
}
#container {
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    background-color: var(--c-panel-1);
    overflow: hidden;
    box-shadow: var(--shadow);
    flex: 1;
}
#content {
    margin: 8px 4px 8px 8px;
    overflow-x: hidden;
    overflow-y: auto;
}
#lists {
    overflow: hidden;
    flex: 1;
}

/* List: All boards */
#all-boards {
    margin: 16px 0 8px;
}

/* Headers */
#lists .header {
    margin: 0 32px 0 8px;
    min-height: 20px;
    position: relative;
    color: var(--c-main-very-weak);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: .04em;
    text-transform: uppercase;
    line-height: 19px;
}
#lists .header .icon {
    display: inline-block;
    height: 20px;
    width: 20px;
    margin-right: 4px;
    color: var(--c-main-very-weak-alt);
    font-size: 16px;
    line-height: 20px;
    vertical-align: bottom;
    text-align: center;
}

/* List */
#lists .list {
    display: block;
    margin-top: 8px;
    margin-bottom: 4px;
    overflow: hidden;
}
#lists .list .content {
    overflow-anchor: none;
}

/* Options */
#options {
    margin: 2px 4px 2px 0;
}
#options > button {
    border: 0;
    padding: 6px 10px;
    color: var(--c-main-very-weak);
    border-radius: var(--border-radius);
    cursor: pointer;
    display: block;
    text-align: left;
    text-decoration: underline;
    margin: 2px 4px 2px 2px;
    width: 100%;
    font-weight: 400;
    box-sizing: border-box;
    position: relative;
    text-transform: none;
    overflow: visible;
}
#options > button:hover {
    background-color: var(--c-gray-8);
    color: var(--c-main);
}
        `;
    }
}

customElements.define( "kb-boards-menu", KbBoardsMenu );

// Boards List Item
class KbBoardsMenuItem extends HTMLElement {
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
                    this.shadowRoot.querySelector("#background-image-large").style.backgroundColor = this.virtual.background.value;
                    this.shadowRoot.querySelector("#background-image-thumb").style.backgroundColor = this.virtual.background.value;
                    break;
                case "image":
                    this.shadowRoot.querySelector("#background-image-large").style.backgroundImage = `url(${this.virtual.background.value})`;
                    this.shadowRoot.querySelector("#background-image-thumb").style.backgroundImage = `url(${this.virtual.background.value})`;
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
        this.dispatchEvent( new Event("close-menu", {
                bubbles: true
            })
        );
    }

    // Setters
    set data(board) {
        this.virtual = board;
    }

    // Getters
    get html() {
        return `
<a id="board-link" href="/b/${this.virtual.id}/${this.virtual.title.toLowerCase().replace(/ /gi, '-')}">
    <div id="background-image-large"></div>
    <div id="background-image-thumb"></div>
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
    margin: 0 4px 4px 0;
    display: block;
}
#board-link {
    display: flex;
    font-weight: 700;
    height: 36px;
    overflow: hidden;
    padding: 0;
    position: relative;
    text-decoration: none;
    user-select: none;
}
#background-image-large {
    background-size: cover;
    background-position: 50%;
    position: absolute;
    width: 100%;
    height: 36px;
    opacity: 1;
    border-radius: var(--border-radius);
}
#background-image-large::before {
    background: white;
    bottom: 0;
    left: 0;
    position: absolute;
    opacity: .88;
    content: "";
    right: 0;
    top: 0;
}
#board-link:hover #background-image-large::before {
    opacity: .78;
}
#background-image-thumb {
    display: inline-block;
    flex: 0 0 auto;
    background-size: cover;
    background-position: 50%;
    position: relative;
    width: 36px;
    height: 36px;
    opacity: .7;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
}
#board-link:hover #background-image-thumb {
    opacity: 1;
}
#title-container {
    display: flex;
    position: relative;
    flex: 1;
    width: 100%;
    padding: 9px 0 9px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#title {
    display: block;
    padding-right: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
        `;
    }
}

customElements.define( "kb-boards-menu-item", KbBoardsMenuItem );
