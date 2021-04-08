"use strict";

class KbHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow( {mode: "open"} );

        // CSS
        // Index
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
        // Component
        this.styleComponent = document.createElement( "style" );
        this.styleComponent.textContent = this.css;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        this.noBoardLayout();

        // Events
        this.shadowRoot.querySelector("#button-home").onclick = () => { return false; };
        this.shadowRoot.querySelector("#button-home").addEventListener("click", () => { switchToBoard(null) } );
        this.shadowRoot.querySelector("#board-title").addEventListener("click", () => { this.editTitle() } );
        this.shadowRoot.addEventListener( "edit-cancel", () => { this.retitleBoard() } );
        this.shadowRoot.addEventListener( "edit-confirm", () => { this.retitleBoard() } );
        this.shadowRoot.querySelector("#button-boards-menu").onclick = () => { this.toggleBoardsMenu() };
        this.shadowRoot.querySelector("#button-info").addEventListener("click", () => { this.openBoardInfo() } );
        this.shadowRoot.querySelector("#button-star").addEventListener("click", () => { this.starBoard() } );
        this.shadowRoot.querySelector("#button-menu").addEventListener("click", () => { this.openMenu() } );
    }

    // Methods
    toggleBoardsMenu() {
        if ( $("kb-boards-menu") ) {
            $("kb-boards-menu").remove();
        } else {
            $("#base").appendChild( document.createElement("kb-boards-menu") );
        }
    }
    async starBoard () {
        if ( await getData( "board-star" ) ) {
            await setData( "board-star", false );
        } else {
            await setData( "board-star", true );
        }
        this.updateStar();
    }
    openBoardInfo() {
        $("#base").appendChild( document.createElement("kb-window-board-info") );
    }
    editTitle() {
        this.shadowRoot.querySelector("#board-title").style.display = "none";
        this.shadowRoot.querySelector("#board-title-edit").style.display = "block";
        this.shadowRoot.querySelector("#board-title-edit").resizeTextareaWidth();
        this.shadowRoot.querySelector("#board-title-edit").select();
    }
    hideEditTitle() {
        this.shadowRoot.querySelector("#board-title").style.display = "";
        this.shadowRoot.querySelector("#board-title-edit").style.display = "";
    }
    retitleBoard() {
        this.hideEditTitle();
        this.shadowRoot.querySelector("#board-title").textContent = this.shadowRoot.querySelector("#board-title-edit").value;
        setData( "board-title", this.shadowRoot.querySelector("#board-title-edit").value );
    }
    async updateStar() {
        // Star
        if ( await getData( "board-star" ) )
            this.shadowRoot.querySelector("#button-star").classList.add( "button-on" );
        else
            this.shadowRoot.querySelector("#button-star").classList.remove( "button-on" );
    }
    darken() {
        this.shadowRoot.querySelector("#content").style.backgroundColor = "rgba(0, 0, 0, 0.32)";
    }
    lighten() {
        this.shadowRoot.querySelector("#content").style.backgroundColor = "";
    }
    openMenu() {
        $("kb-board").openMenu();
        this.shadowRoot.querySelector("#button-menu").style.marginRight = "-83px";
    }
    menuClosed() {
        this.shadowRoot.querySelector("#button-menu").style.marginRight = "";
    }
    defaultLayout() {
        this.shadowRoot.querySelector("#middle-segment").classList.remove("hide");
        this.shadowRoot.querySelector("#right-segment").classList.remove("hide");
        this.shadowRoot.querySelector("#content").style.backgroundColor = "";
    }
    noBoardLayout() {
        this.shadowRoot.querySelector("#middle-segment").classList.add("hide");
        this.shadowRoot.querySelector("#right-segment").classList.add("hide");
        this.shadowRoot.querySelector("#content").style.backgroundColor = accentColors[Math.floor( Math.random() * accentColors.length )];
    }

    // Setters
    set title( title ) {
        this.shadowRoot.querySelector("#board-title").textContent = title;
        this.shadowRoot.querySelector("#board-title-edit").value = title;
    }
    set description( description ) {
        this.shadowRoot.querySelector("#button-info").title = getData( "board-description" );
    }

    // Getters
    get html() {
        return `
<header>
    <div id="content">
        <div id="left-segment">
            <a id="button-home" class="button" href="/">
                <span class="mdi mdi-home-outline"></span>
            </a>
            <button id="button-boards-menu" class="button" title="">
                <span class="icon-sm mdi mdi-view-dashboard"></span>
                <span>Boards</span>
            </button>
        </div>
        <div id="middle-segment">
            <div id="title-container">
                <div id="title">
                    <div id="board-title"></div>
                    <kb-input id="board-title-edit" type="board-title" buttoncontrols="false" enterconfirm="true" autoresize="x" oneline="true"></kb-input>
                </div>
            </div>
        </div>
        <div id="right-segment">
            <button id="button-star" class="button" href="#" title="Click to star or unstar the board.">
                <span class="mdi mdi-star-outline"></span>
            </button>
            <button id="button-info" class="button" href="#" title="*Description text*">
                <span class="mdi mdi-text-subject"></span>
            </button>
            <button id="button-menu" class="button">
                <span class="icon-sm mdi mdi-dots-horizontal"></span>
                <span class="name">Menu</span>
            </button>
        </div>
    </div>
</header>
        `;
    }

    get css() {
        return `
/* Header Bar */
header {
}

div#content {
    background-color: var(--c-black-15);
    transition: background-color 1s ease-in;
    height: 32px;
    min-height: 40px;
    padding: var(--header-gap);
    position: relative;
    overflow: hidden;
    z-index: 10;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
}

/* Global */
.button {
    padding: 0;
    margin-right: var(--header-gap);
    border-radius: var(--border-radius);
    border: 0;
    cursor: pointer;
    text-decoration: none;
    background-color: var(--c-white-30);
    box-shadow: none;
    color: var(--c-white);
    font-weight: 700;
    height: 32px;
    line-height: 32px;
    transition: .1s ease;
    display: flex;
    flex-flow: row nowrap;
}
.button:hover {
    background-color: var(--c-white-20);
}
.button-on {
    color: var(--c-btn-on);
}
.button span:first-child {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    width: 32px;
    text-align: center;
    font-size: 20px;
}

/* Left Segment */
#left-segment {
    display: flex;
    justify-content: flex-start;
    flex-grow: 1;
}
#button-home:hover {
    color: var(--c-white);
}
#button-boards-menu {
    padding-right: 8px;
}

/* Middle Segment */
#middle-segment {
    display: flex;
    height: auto;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: var(--header-gap) 0;
    overflow: hidden;
}
#title-container {
    display: inline-block;
}
#title {
    height: var(--header-width);
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-radius: var(--border-radius);
}
#title:hover {
    background-color: var(--c-white-32);
}
#board-title-edit {
    display: none;
    height: 100%;
}
#board-title {
    color: var(--c-white);
    font-weight: 700;
    font-size: 18px;
    margin: 0 auto;
    padding: 0 12px;
    border: none;
    display: block;
    border-radius: var(--border-radius);
    cursor: pointer;
    white-space: nowrap;
}

/* Right Segment */
#right-segment {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;
}
#button-menu {
    margin: 0;
}
#button-menu > .name {
    margin-right: 8px;
}
        `;
    }
}

customElements.define( "kb-header", KbHeader );
