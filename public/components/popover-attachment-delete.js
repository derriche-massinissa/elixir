"use strict";

class KbPopoverAttachmentDelete extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;

        this.type = "delete";
    }

    // Setters
    set data(attachment) {
        this.attachment = attachment;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        if (this.type === "delete") {
            this.shadowRoot.querySelector("#title").innerText = this.deleteTitle;
            this.shadowRoot.querySelector("p").innerText = this.deleteText;
            this.shadowRoot.querySelector("button.delete").innerText = this.deleteButton;
        } else {
            this.shadowRoot.querySelector("#title").innerText = this.removeTitle;
            this.shadowRoot.querySelector("p").innerText = this.removeText;
            this.shadowRoot.querySelector("button.delete").innerText = this.removeButton;
        }

        // Events
        this.shadowRoot.querySelector("button.delete").onclick = () => { this.deleteAttachment() };
    }

    // Members
    deleteTitle = "Delete Attachment?";
    deleteText = "Deleting an attachment is permanent. There is no undo.";
    deleteButton = "Delete";
    removeTitle = "Remove Attachment?";
    removeText = "Remove this attachment? There is no undo.";
    removeButton = "Remove";

    // Methods
    deleteAttachment() {
        this.attachment.delete();
        this.close();
    }

    // Getters
    get htmlContent() {
        return `
<p></p>
<button class="delete negative"></button>
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

customElements.define( "kb-popover-attachment-delete", KbPopoverAttachmentDelete );
