"use strict";

class KbPopoverColors extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    connectedCallback() {
        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        // Title
        this.shadowRoot.querySelector("#title").innerText = "Colors";

        // Fill with color buttons
        let colorList = this.shadowRoot.querySelector("#color-list");
        for (let color of accentColors) {
            let colorItem = _("li"),
                colorButton = _("button");

            colorButton.style.backgroundColor = color;
            colorButton.onclick = (e) => { this.selectColor(e) };

            colorItem.appendChild( colorButton );
            colorList.appendChild( colorItem );
        }
    }

    // Methods
    selectColor(e) {
        let evt = new CustomEvent("color-selected", {
            detail: e.target.style.backgroundColor,
            bubbles: true
        });
        this.dispatchEvent( evt );
    }

    /* Getters */
    get htmlContent() {
        return `
<ul id="color-list"></ul>
        `;
    }

    get cssContent() {
        return `
#body {
    height: 50vh;
}
#color-list {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    margin: 0;
    padding: 8px 0 0 0;
    list-style: none;
}
#color-list > li {
    height: 56px;
    width: calc(33.3% - 8px + 8px/3);
    margin-bottom: 8px;
    margin-right: 8px;
    padding-top: 0;
}
#color-list > li:nth-child(3n) {
    margin-right: 0px;
}
#color-list > li > button {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    justify-content: center;
    line-height: 0;
}
        `;
    }
}

customElements.define( "kb-popover-colors", KbPopoverColors );
