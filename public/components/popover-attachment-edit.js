"use strict";

class KbPopoverAttachmentEdit extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    connectedCallback() {
        // Input
        this.shadowRoot.querySelector("#add-attachment-name").value = this.attachment.name;
        this.shadowRoot.querySelector("#add-attachment-name").select();
    }

    // Setters
    set data(attachment) {
        this.attachment = attachment;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        // Title
        this.shadowRoot.querySelector("#title").innerText = "Edit Attachment";

        // Events
        this.shadowRoot.querySelector("#confirm-edit-link").onclick= () => { this.editAttachment() };
    }

    // Methods
    editAttachment() {
        let data = {
            name: this.shadowRoot.querySelector("#add-attachment-name").value
        };
        if (data.name !== "") {
            this.attachment.element.edit(data);
            this.close();
        }
    }

    // Getters
    get htmlContent() {
        return `
        <div id="attachment-name-input" class="input">
            <label for="add-attachment-name">Link name</label>
            <input id="add-attachment-name" type="text">
        </div>
        <button id="confirm-edit-link" class="positive">Update</button>
        `;
    }

    get cssContent() {
        return `
div#attachment-name-input {
    display: block;
}
button#confirm-edit-link {
    display: block;
    text-align: left;
    padding: 6px 12px;
    position: relative;
}
.input > label {
    font-weight: 700;
    color: var(--c-main-very-weak);
    font-size: 12px;
    line-height: 16px;
    margin-top: 12px;
    margin-bottom: 4px;
    display: block;
}
.input > input {
    border: 0;
    padding: 8px 12px;
    color: var(--c-main);
    margin: 4px 0 12px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--c-heavy-edit-bg);
    box-shadow: var(--blur-border);
    border-radius: var(--border-radius);
    display: block;
    line-height: 20px;
    font-size: 14px;
}
.input > input:hover {
    background-color: var(--c-panel-2);
}
.input > input:focus {
    background-color: var(--c-white);
    box-shadow: var(--focus-border);
}
        `;
    }
}

customElements.define( "kb-popover-attachment-edit", KbPopoverAttachmentEdit );
