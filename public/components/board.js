"use strict";

class KbBoard extends HTMLElement {
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
    set data(board) {
        // Add a reference on both the DOM and virtual element
        this.virtual = board;
        board.element = this;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;
        
        if (this.virtual.closed) {
            // Header
            $("kb-header").noBoardLayout();

            // Content
            this.shadowRoot.querySelector("#container").classList.add("hide");
            this.shadowRoot.querySelector("#closed-board-message").classList.remove("hide");

            // Events
            this.shadowRoot.querySelector("#closed-board-reopen").onclick = () => { this.reopen() };
            this.shadowRoot.querySelector("#closed-board-delete").onclick = () => { this.deleteAsk() };
        } else {
            // Header
            $("kb-header").defaultLayout();

            // Load lists
            for (let list of this.virtual.lists) {
                // Do not add archived lists
                if (list.archived) continue;
                // Create an empty list
                let listElement = document.createElement( "kb-list" );
                listElement.data = list;
                this.appendChild( listElement );

                // Fill the list with cards
                for (let card of list.cards) {
                    // Do not add archived cards
                    if (card.archived) continue;
                    let cardElement = document.createElement( "kb-card" );
                    cardElement.data = card;
                    listElement.appendChild( cardElement );
                };
            };
        }
    }

    // Methods
    openMenu() {
        this.shadowRoot.querySelector("kb-board-menu").open();
    }
    clear() {
        // Clear references
        for (let list of this.virtual.lists) {
            delete list.element;
            for (let card of list.cards) {
                delete card.element;
            };
        };

        this.remove();
    }
    async close() {
        await setData( "board-close", this.virtual );
        setupBoard( this.virtual );
    }
    async reopen() {
        await setData( "board-reopen", this.virtual );
        setupBoard( this.virtual );
    }
    deleteAsk() {
        let popoverElement = $("kb-popover-board-close");
        if (popoverElement === null) {
            let popover = document.createElement( "kb-popover-board-close" );
            popover.type = "delete";
            popover.data = this.virtual;
            $("#base").appendChild( popover );
        } else {
            popoverElement.close();
        }
    }
    delete() {
        setData( "board-delete", this.virtual );
        setupBoard( null );
    }


    // Getters
    get html() {
        return `
<div id="container">
    <div id="canvas">
        <div id="content" class="fancy-scrollbar">
            <slot></slot>
            <kb-new-list></kb-new-list>
        </div>
    </div>
    <kb-board-menu></kb-board-menu>
</div>
<div id="closed-board-message" class="hide">
    <p id="closed-board-title">“${this.virtual.title}” is closed.</p>
    <button id="closed-board-reopen">Re-open</button>
    <button id="closed-board-delete">Permanently Delete Board…</button>
</div>
        `;
    }

    get css() {
        return `
:host {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
}

div#container {
    flex-grow: 1;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    overflow: hidden;
}
div#canvas {
    position: relative;
    flex-grow: 1;
}
div#content {
    flex-grow: 1;
    user-select: none;
    white-space: nowrap;
    margin-bottom: 8px;
    padding-bottom: 8px;
    padding-top: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-flow: row nowrap;
}
::slotted(*:first-child) {
    margin-left: 8px;
}
::slotted(*),
kb-new-list {
    margin: 0 4px;
}
/* Closed Message */
#closed-board-message {
    margin: 75px auto;
    text-align: center;
    max-width: 600px;
    display: flex;
    flex-flow: column nowrap;
}
#closed-board-title {
    color: var(--c-main-very-weak);
    font-size: 26px;
    margin: 0;
    font-weight: 400;
    line-height: 28px;
    font-family: "Noto Sans Bold", arial;
}
#closed-board-message > button {
    color: var(--c-main-very-weak);
    display: block;
    font-size: 18px;
    line-height: 22px;
    text-decoration: underline;
    margin-top: 64px;
}
#closed-board-message > button:hover {
    color: var(--c-main);
}
#closed-board-reopen {
}
#closed-board-delete {
}
        `;
    }
}

customElements.define( "kb-board", KbBoard );
