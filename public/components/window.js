"use strict";

class KbWindow extends HTMLElement {
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

    setupWindow() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Events
        this.shadowRoot.querySelector("#close-button").onclick = () => {
            this.closeWindow();
        }
        this.shadowRoot.querySelector("#underlay").onclick = () => {
            this.closeWindow();
        }
    }

    // Methods
    closeWindow() {
        this.remove();
    }
    close() {
        this.remove();
    }
    lightUi() {
        this.shadowRoot.querySelector("#close-button").classList.remove("dark");
        this.shadowRoot.querySelector("#close-button").classList.add("light");
    }
    darkUi() {
        this.shadowRoot.querySelector("#close-button").classList.remove("light");
        this.shadowRoot.querySelector("#close-button").classList.add("dark");
    }
    clearUi() {
        this.shadowRoot.querySelector("#close-button").classList.remove("light");
        this.shadowRoot.querySelector("#close-button").classList.remove("dark");
    }

    /* Getters */
    get html() {
        return `
<div id="container">
    <button id="close-button" class="mdi mdi-close"></button>
    <div id="wrapper">
    </div>
</div>
<div id="underlay"></div>
        `;
    }
    get css() {
        return `
/* Window */
:host {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background-color: var(--c-black-64);
    z-index: 50;
    overflow-x: hidden;
    overflow-y: auto;
}
#underlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 52;
}
#container {
    background-color: var(--c-panel-3);
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;
    min-height: 200px;
    z-index: 55;
    margin: 48px 0 80px;
}
#wrapper {
}
#content {
    display: flex;
    flex-flow: column nowrap;
}
/* Window End */

/* Close Button */
#close-button {
    border-radius: 50%;
    position: absolute;
    top: 0;
    right: 0;
    height: 32px;
    width: 32px;
    overflow: hidden;
    padding: 4px;
    margin: 4px;
    z-index: 2;
    box-sizing: content-box;
    font-size: 20px;
    line-height: 32px;
    color: var(--c-main-weak);
}
#close-button:hover {
    background-color: var(--c-gray-8);
}
#close-button.light {
    background-color: var(--dialog-close-button-light-bg);
    color: var(--dialog-close-button-light-fg);
}
#close-button.light:hover {
    background-color: var(--dialog-close-button-light-bg-hover);
}
#close-button.dark {
    background-color: var(--dialog-close-button-dark-bg);
    color: var(--dialog-close-button-dark-fg);
}
#close-button.dark:hover {
    background-color: var(--dialog-close-button-dark-bg-hover);
}
/* Close Button End */
        `;
    }
}
