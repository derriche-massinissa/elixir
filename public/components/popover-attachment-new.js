"use strict";

class KbPopoverAttachmentNew extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    // Setters
    set data(card) {
        this.card = card;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        // Title
        this.shadowRoot.querySelector("#title").innerText = "Attach From…";

        // Events
        this.shadowRoot.querySelector("#upload-file").onchange = () => { this.addFileAttachment() };
        this.shadowRoot.querySelector("#confirm-add-link").onclick = () => { this.addLinkAttachment() };
        this.shadowRoot.querySelector("#add-link").oninput = () => { this.updateNameInput() };
    }

    // Methods
    addFileAttachment() {
        try {
            let file = this.shadowRoot.querySelector("#upload-file").files[0];
            $("kb-window-card").newAttachment(file);
            this.close();
        } catch(err) {
            console.error(err);
        }
    }
    addLinkAttachment() {
        try {
            let link = {
                url: this.shadowRoot.querySelector("#add-link").value,
                name: this.shadowRoot.querySelector("#add-link-name").value || null,
                type: "link"
            };
            $("kb-window-card").newAttachment(link);
            this.close();
        } catch(err) {
            console.error(err);
        }
    }
    updateNameInput() {
        let link = this.shadowRoot.querySelector("#add-link").value;
        if (link !== "")
            this.shadowRoot.querySelector("#link-name-input").classList.remove("hide");
        else
            this.shadowRoot.querySelector("#link-name-input").classList.add("hide");
    }

    // Getters
    get htmlContent() {
        return `
<button id="upload">
    <label for="upload-file">Upload</label>
    <input id="upload-file" class="invisible" type="file">
</button>
<hr>
<div id="link-input" class="input">
    <label for="add-link">Attach a link</label>
    <input id="add-link" type="text" placeholder="Paste any link here…">
</div>
<div id="link-name-input" class="input hide">
    <label for="add-link-name">Link name (optional)</label>
    <input id="add-link-name" type="text">
</div>
<button id="confirm-add-link">Attach</button>
        `;
    }

    get cssContent() {
        return `
#upload {
    display: block;
    width: 100%;
}
#upload > label,
#confirm-add-link {
    display: block;
    text-align: left;
    cursor: pointer;
    padding: 6px 12px;
    position: relative;
    color: var(--c-main);
}
#upload > label:hover,
#confirm-add-link:hover {
    color: var(--c-main-strong);
    background-color: var(--c-gray-8);
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

customElements.define( "kb-popover-attachment-new", KbPopoverAttachmentNew );
