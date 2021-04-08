"use strict";

class KbWindowBoardsArchive extends KbWindow {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    async connectedCallback() {
        this.setupWindow();
        this.shadowRoot.querySelector("#wrapper").innerHTML += this.htmlContent;

        // Fill list
        let closedBoards = await getData("closed-boards");
        for (let board of closedBoards) {
            let boardItem = _("li.archived-board"),
                boardItemElement = _("kb-window-boards-archive-item");
            boardItemElement.data = board;
            boardItem.appendChild( boardItemElement );
            this.shadowRoot.querySelector("#archived-boards").appendChild( boardItem );
        }
    }

    // Methods

    get htmlContent() {
        return `
<header>
    <span class="icon-lg mdi mdi-archive-outline"></span>
    <span class="name">Closed Boards</span>
</header>
<div id="archived-boards-container">
    <div id="archived-boards-content">
        <ul id="archived-boards"></ul>
    </div>
</div>
        `;
    }

    get cssContent() {
        return `
#wrapper {
    width: 768px;
}
header {
    padding: 12px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 68px;
    box-sizing: border-box;
}
header > span.mdi {
    margin-right: 8px;
    display: block;
    color: var(--c-main-weak);
}
header > span.name {
    font-size: 20px;
    font-family: "Noto Sans Bold", arial;
    font-weight: 400;
    line-height: 24px;
    flex: 1;
    margin: 0;
}
#archived-boards-container {
    margin: 24px 48px;
}
#archived-boards-content {
}
#archived-boards {
    margin: 0;
    padding: 0;
}
#archived-boards > li {
    list-style: none;
}
#archived-boards > li > kb-window-boards-archive-item {
    display: block;
}
        `;
    }
}

customElements.define( "kb-window-boards-archive", KbWindowBoardsArchive );

class KbWindowBoardsArchiveItem extends HTMLElement {
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

    // Setters
    set data(board) {
        this.board = board;

        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Events
        this.shadowRoot.querySelector("#option-reopen").onclick = () => { this.reopenBoard() };
        this.shadowRoot.querySelector("#option-delete").onclick = () => { this.deleteBoardAsk() };
    }

    // Methods
    reopenBoard() {
        setData( "board-reopen", this.board );
        this.remove();
    }
    deleteBoardAsk() {
        let popoverElement = $("kb-popover-board-close");
        if (popoverElement === null) {
            let popover = document.createElement( "kb-popover-board-close" );
            popover.type = "delete";
            popover.boardItem = this;
            popover.data = this.board;
            $("#base").appendChild( popover );
        } else {
            popoverElement.close();
        }
    }
    delete() {
        setData( "board-delete", this.board );
        this.remove();
    }

    get html() {
        return `
<div id="container">
    <span id="board-name">${this.board.title}</span>
    <div id="options">
        <button id="option-reopen" class="button-link">
            <span class="icon-sm mdi mdi-restore"></span>
            <span>Re-open</span>
        </button>
        <button id="option-delete" class="negative">
            <span class="icon-sm mdi mdi-minus"></span>
            <span>Delete</span>
        </button>
    </div>
</div>
        `;
    }

    get css() {
        return `
#container {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-bottom: 1px solid var(--c-gray-13);
    padding: 8px 0;
}
#board-name {
    margin: 0 8px;
    flex-grow: 1;
    text-decoration: underline;
    cursor: pointer;
}
#options {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}
#options > button {
    margin-left: 8px;
    padding: 6px 12px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    word-break: keep-all;
}
#options > button > .mdi {
    margin-right: 4px;
}
#options > button > .mdi::before {
    display: block;
}
#option-reopen {
}
#option-reopen:hover {
}
#options-delete {
}
        `;
    }
}

customElements.define( "kb-window-boards-archive-item", KbWindowBoardsArchiveItem );
