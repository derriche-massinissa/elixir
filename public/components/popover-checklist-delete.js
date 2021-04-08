"use strict";

class KbPopoverChecklistDelete extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    // Setters
    set data(checklist) {
        this.checklist = checklist;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        this.shadowRoot.querySelector("#title").innerText = `Delete ${this.checklist.title}?`;

        // Events
        this.shadowRoot.querySelector("button.delete").onclick = () => { this.deleteChecklist() };
    }

    // Methods
    deleteChecklist() {
        this.checklist.element.delete();
        this.close();
    }

    // Getters
    get htmlContent() {
        return `
<p>Deleting a checklist is permanent and there is no way to get it back.</p>
<button class="delete negative">Delete Checklist</button>
        `;
    }

    get cssContent() {
        return `
button.delete {
    width: 100%;
    margin-top: 8px;
    padding: 6px 12px;
}
        `;
    }
}

customElements.define( "kb-popover-checklist-delete", KbPopoverChecklistDelete );
