"use strict";

class KbNewList extends HTMLElement {
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

        // Events
        this.shadowRoot.querySelector("#new-list-button").addEventListener( "click", () => { this.showEdit() } );
        this.shadowRoot.addEventListener( "edit-cancel", () => { this.hideEdit() } );
        this.shadowRoot.addEventListener( "edit-confirm", () => { this.createList() } );

    }

    showEdit() {
        this.shadowRoot.querySelector("#new-list-button").style.display = "none";
        this.shadowRoot.querySelector("#new-list-edit").style.display = "block";
        this.shadowRoot.querySelector("kb-input").value = "";
        this.shadowRoot.querySelector("kb-input").focus();
    }
    hideEdit() {
        this.shadowRoot.querySelector("#new-list-button").style.display = "";
        this.shadowRoot.querySelector("#new-list-edit").style.display = "";
        this.shadowRoot.querySelector("kb-input").value = "";
    }
    async createList() {
        let title = this.shadowRoot.querySelector("kb-input").value,
            data = await setData( "list-create", title );
        let newList = document.createElement( "kb-list" );
        newList.data = data.list;
        $("kb-board").appendChild( newList );
        this.scrollIntoView( false );
        this.shadowRoot.querySelector("kb-input").value = "";
        this.shadowRoot.querySelector("kb-input").focus();
    }

    get html() {
        return `
<div id="container">
    <div id="content">
        <button id="new-list-button">
            <span>
                <span class="mdi mdi-plus icon-sm"></span>
                Add another list
            </span>
        </button>
        <div id="new-list-edit">
            <kb-input placeholder="Enter list title..." oneline="true" gap="4" enterconfirm="true"></kb-input>
        </div>
    </div>
</div>
        `;
    }

    get css() {
        return `
#container {
    display: inline-block;
    min-width: 272px;
    height: auto;
    box-sizing: border-box;
    white-space: nowrap;
    position: relative;
}
#container::after {
    content: "";
    position: absolute;
    height: 100%;
    width: calc( var(--list-gap) * 2 );
    right: calc( var(--list-gap) * -2 );
}
#content {
}
#new-list-button {
    background-color: var(--c-white-24);
    cursor: pointer;
    color: var(--c-white);
    border-radius: var(--border-radius);
    min-height: 40px;
    width: 100%;
    padding: 4px 12px;
    display: flex;
    align-items: center;
}
#new-list-button:hover {
    background-color: var(--c-white-32);
}
#new-list-edit {
    display: none;
    background-color: var(--c-panel-2);
    padding: 4px;
    border-radius: var(--border-radius);
}
        `;
    }
}

customElements.define( "kb-new-list", KbNewList );
