"use strict";

class KbCardComposer extends HTMLElement {
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

        // Events
        this.shadowRoot.querySelector("#open-card-composer").addEventListener( "click", () => { this.showEdit() } );
        this.shadowRoot.addEventListener( "edit-cancel", () => { this.hideEdit() } );
        this.shadowRoot.addEventListener( "edit-confirm", () => { this.newCard() } );
    }

    showEdit() {
        this.shadowRoot.querySelector("#open-card-composer").style.display = "none";
        this.shadowRoot.querySelector("kb-input").style.display = "block";
        this.shadowRoot.querySelector("kb-input").focus();
    }

    hideEdit() {
        this.shadowRoot.querySelector("#open-card-composer").style.display = "flex";
        this.shadowRoot.querySelector("kb-input").style.display = "none";
        this.shadowRoot.querySelector("kb-input").value = "";
    }

    newCard() {
        if (this.shadowRoot.querySelector("kb-input").value === "")
            return;

        let evt = new Event("card-created", {
            bubbles: true
        });
        this.dispatchEvent( evt );

        // Clear and refocus the editor
        this.shadowRoot.querySelector("kb-input").value = "";
        this.shadowRoot.querySelector("kb-input").focus();
    }

    get value() {
        return this.shadowRoot.querySelector("kb-input").value;
    }

    get html() {
        return `
<div id="container">
    <button id="open-card-composer">
        <span class="plus-icon icon-sm mdi mdi-plus"></span>
        <span class="add-a-card">Add a card</span>
    </button>
    <kb-input type="card" enterconfirm="true" confirmtext="Add Card" placeholder="Enter a title for this card..."></kb-input>
</div>
        `;
    }

    get css() {
        return `
#container {
    min-height: 36px;
    display: flex;
    flex-flow: row nowrap;
    box-sizing: border-box;
    padding: 0 var(--list-gap) var(--list-gap);
    margin: 0 var(--list-gap) var(--list-gap);
}
#open-card-composer {
    flex-grow: 1;
    color: var(--c-main-very-weak);
    border-radius: var(--border-radius);
    position: relative;
    padding: 0 8px;
    user-select: none;
    display: flex;
    align-items: center;
    flex-flow: row nowrap;
    cursor: pointer;
}
#open-card-composer:hover {
    background-color: var(--c-gray-8);
    color: var(--color-main);
}
.plus-icon {
    margin-right: 2px;
    display: inline-block;
}
.add-a-card {
    line-height: 20px;
}
kb-input {
    display: none;
    width: 100%;
}
        `;
    }
}

customElements.define( "kb-card-composer", KbCardComposer );
