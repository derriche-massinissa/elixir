"use strict";

class KbPlaceholder extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow( {mode: "open"} );

        // Component style
        this.styleComponent = document.createElement( "style" );
        this.styleComponent.textContent = this.css;
        this.root.appendChild( this.styleComponent );
        this.root.innerHTML += this.html;
    }

    set height( value ) {
        this.root.querySelector("#placeholder-body").style.height = value + "px";
    }

    set minHeight( value ) {
        this.root.querySelector("#placeholder-body").style.minHeight = value + "px";
    }

    set isList( value ) {
        if (value === true)
            this.shadowRoot.querySelector("#placeholder-body").classList.add( "list" );
        else
            this.shadowRoot.querySelector("#placeholder-body").classList.remove( "list" );
    }

    html = `
<div id="placeholder-body"></div>
    `;

    css = `
:host {
    display: block;
}
div {
    background-color: var(--c-gray-4);
}
#placeholder-body {
    border-radius: var(--border-radius);
}
.list {
    min-width: 272px;
    max-width: 272px;
    height: 100%;
    box-sizing: border-box;
    white-space: nowrap;
    background-color: var(--c-black-24);
}
    `;
}

customElements.define( "kb-placeholder", KbPlaceholder );
