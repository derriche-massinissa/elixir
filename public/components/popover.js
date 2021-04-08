"use strict";

class KbPopover extends HTMLElement {
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

    setup() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Events
        this.shadowRoot.querySelector("#close-button").onclick = () => { this.close() };
    }

    // Methods
    close() {
        this.remove();
    }

    // Getters
    get html() {
        return `
<div id="container">
    <header>
        <div id="title">Title</div>
        <button id="close-button" class="mdi mdi-close"></button>
    </header>
    <div id="body" class="fancy-scrollbar">
    </div>
</div>
        `;
    }

    get css() {
        return `
hr {
    background-color: var(--c-gray-13);
    padding: 0;
    border: 0;
    width: 100%;
    height: 1px;
    box-sizing: content-box;
}
:host {
    display: block;
    position: fixed;
    width: 304px;
    top: 44px;
    right: 8px;
    border-radius: var(--border-radius);
    box-sizing: border-box;
    overflow: hidden;
    background-color: var(--c-white);
    z-index: 1000;
    max-height: calc(100% - 48px);
    box-shadow: var(--shadow);
}
#container > header {
    margin-bottom: 8px;
    padding: 0 12px;
    position: relative;
    text-align: center;
    display: grid;
    grid-template-columns: 12px 1fr 12px;
}
#title {
    border-bottom: 1px solid var(--c-gray-13);
    color: var(--c-main-very-weak);
    height: 40px;
    display: block;
    line-height: 40px;
    margin: 0;
    overflow: hidden;
    padding: 0 32px;
    position: relative;
    grid-column: 1/span 3;
    grid-row: 1;
    text-align: center;
    font-size: 14px;
    line-height: 40px;
    font-weight: 400;
}
#close-button {
    grid-column: 3;
    grid-row: 1;
    color: var(--c-main-very-weak-alt);
    cursor: pointer;
    padding: 0;
    margin: 0;
    z-index: 2;
    text-align: center;
    font-size: 16px;
}
#close-button:hover {
    color: var(--c-main);
}
#body {
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0 12px 12px 12px;
}
        `;
    }
}
