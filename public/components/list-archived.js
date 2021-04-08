"use strict";

class KbListArchived extends HTMLElement {
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
    set data(list) {
        this.virtual = list;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Title
        this.shadowRoot.querySelector("#list-title").innerText = this.virtual.title;

        // Events
        this.shadowRoot.querySelector("#restore-list").onclick = () => { this.restoreList() };
    }

    // Methods
    restoreList() {
        // Create the list
        let listElement = document.createElement( "kb-list" );
        listElement.data = this.virtual;

        // Fill the list with cards
        for (let card of this.virtual.cards) {
            // Do not add archived cards
            if (card.archived) continue;
            let cardElement = document.createElement( "kb-card" );
            cardElement.data = card;
            listElement.appendChild( cardElement );
        };

        let index = this.virtual.parent.lists.indexOf(this.virtual);
        let nextL = $("#board").children[index] || null;
        // Do not insert after the new list button
        if (nextL === null)
            nextL = $("kb-new-list", $("#board"));
        $("#board").insertBefore(listElement, nextL);

        // Save changes
        setData( "list-restore", this.virtual );

        // Remove from archive
        this.remove();
    }

    // Getters
    get html() {
        return `
<li id="container" class="clearfix">
    <div id="list-title"></div>
    <button id="restore-list" class="button-link">
        <span class="icon-sm mdi mdi-restore"></span>
        <span>Send to Board</span>
    </button>
</li>
        `;
    }

    get css() {
        return `
#container {
    list-style: none;
    display: block;
    border-bottom: 1px solid var(--c-gray-13);
    padding: 2px 0;
    position: relative;
}
#list-title {
    padding: 8px;
    float: left;
}
#restore-list {
    margin: 6px 0;
    float: right;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 6px;
}
#restore-list > span {
    margin-right: 6px;
}
#restore-list > span::before {
    display: block;
}
        `;
    }
}

customElements.define( "kb-list-archived", KbListArchived );
