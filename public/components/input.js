"use strict";

class KbInput extends HTMLElement {
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

    // Properties
    confirmText = "Confirm";
    enterConfirm = false;
    buttonControls = true;
    type = "input";
    autoResize = "y";
    placeholder = "";
    oneLine = false;
    gap = 8;

    // Attributes
    static get observedAttributes() {
        return ["confirmtext", "enterconfirm", "buttoncontrols", "type", "autoresize", "placeholder", "oneline", "gap"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case "confirmtext":
                this.confirmText = newValue;
                break;
            case "enterconfirm":
                this.enterConfirm = (newValue === "true");
                break;
            case "buttoncontrols":
                this.buttonControls = (newValue === "true");
                break;
            case "type":
                this.type = newValue;
                break;
            case "autoresize":
                this.autoResize = newValue;
                break;
            case "placeholder":
                this.placeholder = newValue;
                break;
            case "oneline":
                this.oneLine = (newValue === "true");
                break;
            case "gap":
                this.gap = parseInt(newValue);
                break;
        }
    }

    connectedCallback() {
        // Main content
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Type
        switch(this.type) {
            case "card":
                this.shadowRoot.querySelector("textarea").classList.add("card");
                break;
            case "list-title":
                this.shadowRoot.querySelector("textarea").classList.add("list-title");
                break;
            case "board-title":
                this.shadowRoot.querySelector("textarea").classList.add("board-title");
                break;
            case "window-card-title":
                this.shadowRoot.querySelector("textarea").classList.add("window-card-title");
                break;
            default:
                this.shadowRoot.querySelector("textarea").classList.add("input");
                break;
        }

        // One Line
        if (this.oneLine) {
                this.shadowRoot.querySelector("textarea").classList.add("one-line");
                this.shadowRoot.querySelector("textarea").setAttribute( "rows", "1" );
        }

        // Placeholder
        this.shadowRoot.querySelector("textarea").placeholder = this.placeholder;

        // Gap
        this.shadowRoot.querySelector("#controls").style.marginTop = this.gap + "px";

        // Buttons
        if (!this.buttonControls) {
            this.shadowRoot.querySelector("#controls").style.display = "none";
            this.shadowRoot.querySelector("#container").style.height = "100%";
            this.shadowRoot.querySelector("textarea").style.height = "100%";
        }

        // Events
        if (this.buttonControls) {
            this.shadowRoot.querySelector("#cancel").addEventListener("click", () => { this.cancelEdit() } );
            this.shadowRoot.querySelector("#confirm").addEventListener("click", () => { this.confirmEdit() } );
        }
        if (this.autoResize === "y") {
            this.shadowRoot.querySelector("textarea").addEventListener("input", () => { this.resizeTextareaHeight() } );
        } else if (this.autoResize === "x") {
            this.shadowRoot.querySelector("textarea").addEventListener("input", () => { this.resizeTextareaWidth() } );
        }
        this.shadowRoot.querySelector("textarea").addEventListener("keydown", (e) => {
            this.keyboardControl(e);
        });
    }

    // Methods
    focus() {
        this.shadowRoot.querySelector("textarea").focus();
    }
    select() {
        this.shadowRoot.querySelector("textarea").select();
    }
    cancelEdit() {
        const evt = new Event("edit-cancel", {
            bubbles: true
        });
        this.dispatchEvent( evt );
        this.shadowRoot.querySelector("textarea").style.height = "";
    }
    confirmEdit() {
        const evt = new Event("edit-confirm", {
            bubbles: true
        });
        this.dispatchEvent( evt );
        this.shadowRoot.querySelector("textarea").style.height = "";
    }
    keyboardControl(e) {
        if (e.keyCode === 13 && this.enterConfirm) {    // Enter
                e.preventDefault();
                this.confirmEdit();
        } else if (e.keyCode === 27) {  // Escape
                e.preventDefault();
                this.cancelEdit();
        }
    }
    resizeTextareaHeight() {
        this.shadowRoot.querySelector("textarea").style.height = "5px";
        this.shadowRoot.querySelector("textarea").style.height = this.shadowRoot.querySelector("textarea").scrollHeight + "px";
    }
    resizeTextareaWidth() {
        this.shadowRoot.querySelector("textarea").style.width = "5px";
        this.shadowRoot.querySelector("textarea").style.width = this.shadowRoot.querySelector("textarea").scrollWidth + "px";
    }

    // Setters
    set value( value ) {
        this.shadowRoot.querySelector("textarea").value = value;
    }

    // Getters
    get value() {
        return this.shadowRoot.querySelector("textarea").value;
    }
    get textAreaStyle() {
        return this.shadowRoot.querySelector("textarea").style;
    }
    get html() {
        return `
<div id="container">
    <textarea rows="1"></textarea>
    <div id="controls">
        <button id="confirm" class="positive">${this.confirmText}</button>
        <button id="cancel" class="neutral mdi mdi-close icon-lg"></button>
    </div>
</div>
        `;
    }
    get css() {
        return `
:host {
    display: flex;
    flex-flow: column nowrap;
}
#container {
    flex-grow: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
}
textarea {
    border-radius: var(--border-radius);
    color: var(--c-main);
    resize: none;
    width: 100%;
    box-sizing: border-box;
    padding: 6px 8px;
    border: none;
    margin: 0;
    cursor: text;
    font-size: 14px;
    box-shadow: var(--focus-border);
    flex-grow: 1;
}
#controls {
    margin-top: 8px;
    display: flex;
    flex-shrink: 1;
}
button#confirm {
    margin-right: 4px;
    line-height: 20px;
    padding: 6px 12px;
}

.one-line {
    white-space: nowrap;
    overflow-x: hidden;
    padding: 8px 12px;
}

/* Type: Input (Default) */
.input {
    background-color: var(--c-white);
}
/* Type: Card */
.card {
    background-color: var(--c-panel-1);
    box-shadow: var(--shadow-card);
    overflow-x: hidden;
    overflow-y: auto;
    overflow-wrap: break-word;
    min-height: 66px;
    max-height: 200px;
}
/* Type: List Title */
.list-title {
    height: 32px;
    font-weight: 600;
}
/* Type: Board Title */
.board-title {
    font-weight: 700;
    font-size: 18px;
    line-height: 32px;
    padding: 0 12px;
}
/* Type: Card Details Title */
.window-card-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    color: var(--c-main);
}
        `;
    }
}

customElements.define( "kb-input", KbInput );
