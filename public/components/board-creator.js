"use strict";

class KbBoardCreator extends HTMLElement {
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

        // Setup
        this.shadowRoot.querySelector("#create-board-button").disabled = true;
        this.shadowRoot.querySelector("#board-creator-info").style.backgroundColor = accentColors[0];
        this.colorCheck();
        this.bgType = "color";
        this.bgValue = accentColors[0];

        // Events
        this.shadowRoot.querySelector("#board-creator-close").onclick = () => { this.closeBoardCreator() };
        this.shadowRoot.querySelector("#board-creator-title").oninput = (e) => { this.titleInput(e) };
        this.shadowRoot.querySelector("#board-creator-color-button > button").onclick = () => { this.colorPopover(); };
        this.shadowRoot.querySelector("#board-creator-bg-image-file").onchange = () => { this.imageSelected(); };
        this.addEventListener("color-selected", (e) => { this.colorSelected(e) });
        this.shadowRoot.querySelector("#create-board-button").onclick = () => { this.createBoard() };
    }

    // Methods
    closeBoardCreator() {
        this.remove();
    }
    titleInput(e) {
        if (e.target.value !== "")
            this.shadowRoot.querySelector("#create-board-button").disabled = false;
        else
            this.shadowRoot.querySelector("#create-board-button").disabled = true;
    }
    colorCheck() {
        this.shadowRoot.querySelector("#board-creator-color-button > button").classList.add("is-selected");
        this.shadowRoot.querySelector("#board-creator-color-button > button").innerHTML = '<span class="mdi mdi-check"></span>';
        this.shadowRoot.querySelector("#board-creator-file-form > label").classList.remove("is-selected");
        this.shadowRoot.querySelector("#board-creator-file-form > label").innerHTML = "";
    }
    imageCheck() {
        this.shadowRoot.querySelector("#board-creator-file-form > label").classList.add("is-selected");
        this.shadowRoot.querySelector("#board-creator-file-form > label").innerHTML = '<span class="mdi mdi-check"></span>';
        this.shadowRoot.querySelector("#board-creator-color-button > button").classList.remove("is-selected");
        this.shadowRoot.querySelector("#board-creator-color-button > button").innerHTML = "";
    }
    colorPopover() {
        this.appendChild( document.createElement("kb-popover-colors") );
    }
    colorSelected(e) {
        let color = e.detail;
        this.shadowRoot.querySelector("#board-creator-info").style.backgroundColor = color;
        this.colorCheck();
        this.bgType = "color";
        this.bgValue = color;
    }
    async imageSelected() {
        this.imageCheck();
        let image = this.shadowRoot.querySelector("#board-creator-bg-image-file").files[0],
            imageUrl = await uploadBackgroundImage( image );
        // Display the uploaded image
        this.shadowRoot.querySelector("#board-creator-info").style.backgroundImage = `url(${imageUrl})`;
        this.bgType = "image";
        this.bgValue = imageUrl;
    }
    async createBoard() {
        // Save the new board
        let title = this.shadowRoot.querySelector("#board-creator-title").value,
            board = await setData( "board-create", title, this.bgType, this.bgValue );
        board = board.board;
        // Close the board creator
        this.closeBoardCreator();
        // Switch to the new board
        switchToBoard( board );
    }

    // Getters
    get html() {
        return `
<div id="wrapper">
    <div id="container">
        <div id="board-creator">
            <div id="board-creator-info">
                <button id="board-creator-close">
                    <span class="icon-sm mdi mdi-close"></span>
                </button>
                <input id="board-creator-title" type="text" placeholder="Add board title" autocomplete="off" autocorrect="off" spellcheck="false">
            </div>
            <div id="board-creator-background">
                <div id="board-creator-color-button">
                    <button></button>
                </div>
                <form id="board-creator-file-form" action="javascript:void(0);" method="POST" enctype="multipart/form-data">
                    <input id="board-creator-bg-image-file" class="invisible" type="file">
                    <label id="board-creator-bg-image-label" for="board-creator-bg-image-file"></label>
                </form>
            </div>
        </div>
        <div id="board-creator-options">
            <button id="create-board-button" class="positive">Create Board</button>
        </div>
    </div>
    <slot></slot>
</div>
        `;
    }

    get css() {
        return `
/* Wrapper */
:host {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 80;
}
#wrapper {
    display: flex;
    height: 100vh;
    justify-content: center;
    overflow: auto;
    width: 100vw;
    align-items: flex-start;
    background-color: var(--c-black-75);
}
#container {
    position: relative;
    top: 44px;
    margin-bottom: 80px;
}

/* Board Creator */
#board-creator {
    display: flex;
    align-items: center;
}
#board-creator-info {
    background-color: transparent;
    background-image: url("null");
    background-size: cover;
    background-position: 50%;
    border-radius: var(--border-radius);
    box-sizing: border-box;
    color: var(--c-white);
    height: 96px;
    padding: 10px 10px 10px 16px;
    position: relative;
    width: 296px;
}
#board-creator-info::before {
    background-color: var(--c-black-40);
    position: absolute;
    bottom: 0;
    content: "";
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
}
#board-creator-close {
    margin: 0;
    padding: 0;
    color: var(--c-white);
    float: right;
    position: relative;
    right: -2px;
    top: -2px;
    cursor: pointer;
    overflow: visible;
}
#board-creator-close > span {
    vertical-align: bottom;
    display: block;
}
#board-creator-title {
    color: var(--c-white);
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 700;
    position: relative;
    left: -8px;
    line-height: 24px;
    padding: 2px 8px;
    width: calc(100% - 18px - 16px);
    display: block;
    background: transparent;
    border: none;
    box-shadow: 0;
    border-radius: var(--border-radius);
}
#board-creator-title::placeholder {
    color: var(--c-white-60);
}
#board-creator-title:focus {
    background-color: var(--c-white-30);
}
#board-creator-title:hover {
    background-color: var(--c-white-15);
}
#board-creator-background {
    width: 100px;
    height: 96px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    margin: 0 0 0 8px;
    padding: 0;
}
#board-creator-color-button {
    width: 100%;
    height: 50%;
    margin-bottom: 4px;
}
#board-creator-file-form {
    width: 100%;
    height: 50%;
    margin-top: 4px;
}
#board-creator-color-button > button,
#board-creator-file-form > label {
    width: 100%;
    height: 100%;
    background-position: 50%;
    background-size: cover;
    border-radius: var(--border-radius);
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: none;
    padding: 0;
    line-height: 0;
    background-color: red;
}
#board-creator-color-button > button {
    background-image: url("/images/ui/new-board-color-bg.jpg");
}
/* Start of edit */
#board-creator-file-form > label {
    background-image: url("/images/ui/new-board-image-bg.jpg");
}
#board-creator-color-button > button::before,
#board-creator-file-form > label::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    content: "";
    z-index: 0;
}
#board-creator-color-button > button:hover::before,
#board-creator-file-form > label:hover::before {
    background-color: var(--c-black-15);
}
#board-creator-color-button > button.is-selected::before,
#board-creator-file-form > label.is-selected::before {
    background-color: var(--c-black-40);
}
#board-creator-color-button > button.is-selected:hover::before,
#board-creator-file-form > label.is-selected:hover::before {
    background-color: var(--c-black-60);
}
#board-creator-color-button > button > span,
#board-creator-file-form > label > span {
    position: relative;
    z-index: 1;
    display: inline-block;
    flex-basis: 100%;
    font-size: 16px;
    height: 24px;
    line-height: 24px;
    color: var(--c-white);
    text-align: center;
}

/* Options */
#board-creator-options {
    margin-top: 8px;
}
#create-board-button {
    padding: 6px 12px;
    width: 111px;
    margin: 8px 0;
}
        `;
    }
}

customElements.define( "kb-board-creator", KbBoardCreator );
