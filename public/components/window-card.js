"use strict";

class KbWindowCard extends KbWindow {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    connectedCallback() {
        this.setupWindow();
        this.shadowRoot.querySelector("#wrapper").innerHTML += this.htmlContent;

        // Push the new state
        let urlTitle = this.card.title.toLowerCase().replace(/ /gi, "-");
        window.history.pushState("", "", `/c/${this.card.id}/${urlTitle}`);
        document.title = `${this.card.title} on ${this.card.parent.parent.title} | Elixir`;

        // Is archived
        if (this.card.archived)
            this.makeArchived(true);

        // Cover
        let acceptedAttachmentTypes = imageTypes.concat(audioTypes);
        this.shadowRoot.querySelector("#card-option-cover-file").setAttribute("accept", acceptedAttachmentTypes);
        if (this.card.content.cover !== null)
            this.setCover();

        // Title
        this.shadowRoot.querySelector("#title-text").innerText = this.card.title;

        // Description
        this.updateDescriptionStyle();

        // Attachments
        this.card.content.attachments.forEach( attachment => {
            this.addAttachment( attachment );
        });
        if (this.card.content.attachments.length > 0)
            this.shadowRoot.querySelector("#attachments").classList.remove("hide");

        // Checklists
        this.card.content.checklists.forEach( checklist => {
            this.addChecklist( checklist );
        });
        if (this.card.content.checklists.length > 0)
            this.shadowRoot.querySelector("#checklists-container").classList.remove("hide");

        // Events
        // Title
        this.shadowRoot.querySelector("#title-text").onclick = () => { this.editTitle() };
        this.shadowRoot.querySelector("#title-container").addEventListener( "edit-confirm", () => { this.saveTitle() } );
        this.shadowRoot.querySelector("#title-container").addEventListener( "edit-cancel", () => { this.resetTitle() } );
        // Description
        this.shadowRoot.querySelector("#description-text").onclick = () => { this.editDescription() };
        this.shadowRoot.querySelector("#description-container").addEventListener( "edit-confirm", () => { this.saveDescription() } );
        this.shadowRoot.querySelector("#description-container").addEventListener( "edit-cancel", () => { this.resetDescription() } );
        // Cover
        this.shadowRoot.querySelector("#cover").onclick = () => { this.viewCover() };
        this.shadowRoot.querySelector("#card-option-cover-file").onchange = (e) => { this.newCover(e) };
        this.addEventListener("make-cover", () => { this.setCover() });
        this.addEventListener("remove-cover", () => { this.removeCover() });
        // Checklists
        this.shadowRoot.querySelector("#card-option-checklist").onclick = (e) => { this.newChecklist(e) };
        this.addEventListener("checklist-deleted", () => { this.clearChecklist() });
        // Attachments
        this.shadowRoot.querySelector("#card-option-attachment").onclick = (e) => { this.openAttachmentPopOver(e) };
        this.addEventListener("attachment-deleted", (e) => { this.clearAttachment(e) });
        // Move Card
        this.shadowRoot.querySelector("#card-option-move").onclick = (e) => { this.openMovePopOver(e) };
        // Checklist Items
        this.addEventListener("item-checked", () => { this.card.element.updateBadges() });
        this.addEventListener("item-created", () => { this.card.element.updateBadges() });
        this.addEventListener("item-deleted", () => { this.card.element.updateBadges() });
        this.addEventListener("item-moved", () => { this.updateChecklistProgress() });
        // Archive
        this.shadowRoot.querySelector("#card-option-archive").onclick = (e) => { this.archiveCard(e) };
        this.shadowRoot.querySelector("#card-option-restore").onclick = (e) => { this.restoreCard(e) };
        this.shadowRoot.querySelector("#card-option-delete").onclick = (e) => { this.deleteCard(e) };
    }

    // Methods
    // Close
    closeWindow() {
        // Push the new state
        let urlTitle = this.card.parent.parent.title.toLowerCase().replace(/ /gi, "-");
        window.history.pushState("", "", `/b/${this.card.parent.parent.id}/${urlTitle}`);
        document.title = `${this.card.parent.parent.title} | Elixir`;

        this.remove();
    }
    // Archived
    makeArchived(state = false) {
        if (state) {
            this.shadowRoot.querySelector("#banner-archive").classList.remove("hide");
            this.shadowRoot.querySelector("#card-option-restore").classList.remove("hide");
            this.shadowRoot.querySelector("#card-option-delete").classList.remove("hide");
            this.shadowRoot.querySelector("#card-option-archive").classList.add("hide");
        } else {
            this.shadowRoot.querySelector("#banner-archive").classList.add("hide");
            this.shadowRoot.querySelector("#card-option-restore").classList.add("hide");
            this.shadowRoot.querySelector("#card-option-delete").classList.add("hide");
            this.shadowRoot.querySelector("#card-option-archive").classList.remove("hide");
        }
    }
    archiveCard(e) {
        this.card.element.archive();
        this.makeArchived(true);
    }
    restoreCard(e) {
        this.card.element.restore();
        this.makeArchived(false);
    }
    deleteCard(e) {
        this.card.element.delete();
        this.close();
    }
    // Title
    editTitle() {
        this.shadowRoot.querySelector("#title-text").classList.add("hide");
        this.shadowRoot.querySelector("#title-input").classList.remove("hide");
        this.shadowRoot.querySelector("#title-input").value = this.card.title;
        this.shadowRoot.querySelector("#title-input").resizeTextareaHeight();
        this.shadowRoot.querySelector("#title-input").select();
    }
    saveTitle() {
        this.shadowRoot.querySelector("#title-text").classList.remove("hide");
        this.shadowRoot.querySelector("#title-input").classList.add("hide");
        let newTitle = this.shadowRoot.querySelector("#title-input").value;
        // Update DOM
        this.shadowRoot.querySelector("#title-text").innerText = newTitle;
        this.card.element.title = newTitle;
    }
    resetTitle() {
        this.shadowRoot.querySelector("#title-text").classList.remove("hide");
        this.shadowRoot.querySelector("#title-input").classList.add("hide");
    }
    // Description
    editDescription() {
        this.shadowRoot.querySelector("#description-text").classList.add("hide");
        this.shadowRoot.querySelector("#description-input").classList.remove("hide");
        this.shadowRoot.querySelector("#description-input").value = this.card.content.description || "";
        this.shadowRoot.querySelector("#description-input").resizeTextareaHeight();
        this.shadowRoot.querySelector("#description-input").select();
    }
    saveDescription() {
        this.shadowRoot.querySelector("#description-text").classList.remove("hide");
        this.shadowRoot.querySelector("#description-input").classList.add("hide");
        let newDescription = this.shadowRoot.querySelector("#description-input").value;
        // Update data & server data
        this.card.element.description = newDescription;
        // Update DOM
        this.updateDescriptionStyle()
        this.card.element.updateBadges();
    }
    resetDescription() {
        this.shadowRoot.querySelector("#description-text").classList.remove("hide");
        this.shadowRoot.querySelector("#description-input").classList.add("hide");
    }
    updateDescriptionStyle() {
        if (typeof this.card.content.description !== "undefined") {
            if (this.card.content.description !== "" && this.card.content.description !== null) {
                this.shadowRoot.querySelector("#description-text").innerText = this.card.content.description;
                this.shadowRoot.querySelector("#description-text").classList.remove("empty");
            } else {
                this.shadowRoot.querySelector("#description-text").innerText = "Add a more detailed description…";
                this.shadowRoot.querySelector("#description-text").classList.add("empty");
            }
        } else {
            this.shadowRoot.querySelector("#description-text").innerText = "Add a more detailed description…";
            this.shadowRoot.querySelector("#description-text").classList.add("empty");
        }
    }
    // Cover
    setCover() {
        let attachment = this.card.content.attachments.find( attachment => attachment.id === this.card.content.cover );
        this.shadowRoot.querySelector("#cover").style.backgroundImage = `url(${attachment.url})`;
        this.shadowRoot.querySelector("#cover").style.backgroundColor = attachment.color;
        let luminance = getLuminanceHex(attachment.color);
        if (luminance > 128)
            this.darkUi();
        else
            this.lightUi();

        this.shadowRoot.querySelector("#cover").classList.remove("hide");
        this.updateCoverButtons();
    }
    removeCover() {
        this.shadowRoot.querySelector("#cover").classList.add("hide");
        this.shadowRoot.querySelector("#cover").style.backgroundImage = "";
        this.shadowRoot.querySelector("#cover").style.backgroundColor = "";
        this.clearUi();
        this.updateCoverButtons();
    }
    async newCover(e) {
        try {
            let file = e.target.files[0],
                attachment = await this.newAttachment(file);

            attachment.element.makeCover();
            this.updateCoverButtons();
        } catch (err) {
            console.error( err );
        }
    }
    viewCover() {
        let coverAttachment = this.card.content.attachments.find( attachment => attachment.id === this.card.content.cover );
        let attachmentViewer = document.createElement( "kb-attachment-viewer" );
        attachmentViewer.data = coverAttachment.element;
        $("#base").appendChild( attachmentViewer );
    }
    // Checklists
    async newChecklist(e) {
        try {
            let response = await this.card.element.createChecklist("Checklist"),
                checklist = response.checklist;
            this.addChecklist(checklist);

            this.shadowRoot.querySelector("#checklists-container").classList.remove("hide");

            return checklist;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    addChecklist(checklist) {
        let checklistComponent = document.createElement("kb-checklist");
        checklistComponent.slot = "checklists";
        checklistComponent.data = checklist;
        this.appendChild( checklistComponent );
    }
    clearChecklist() {
        // Check if checklist container needs to be hidden
        if (this.card.content.checklists.length > 0)
            this.shadowRoot.querySelector("#checklists-container").classList.remove("hide");
        else
            this.shadowRoot.querySelector("#checklists-container").classList.add("hide");
        // Update badge
        this.card.element.updateBadges();
    }
    updateChecklistProgress() {
        for (let checklist of this.card.content.checklists)
            checklist.element.updateProgress();
    }
    // Attachments
    openAttachmentPopOver(e) {
        let popover = document.createElement("kb-popover-attachment-new");
        popover.data = this.card;
        $("#base").appendChild( popover );
    }
    async newAttachment(obj) {
        try {
            let response = await this.card.element.createAttachment(obj),
                attachment = response.attachment;
            this.addAttachment(attachment, true);

            this.shadowRoot.querySelector("#attachments").classList.remove("hide");

            return attachment;
        } catch (err) {
            console.error( err );
            throw err;
        }
    }
    addAttachment(attachment, prepend = false) {
        let attachmentComponent = document.createElement("kb-attachment");
        attachmentComponent.slot = "attachments";
        attachmentComponent.data = attachment;
        if (prepend)
            this.prepend( attachmentComponent );
        else
            this.appendChild( attachmentComponent );
    }
    updateCoverButtons() {
        for (let attachment of this.children)
            attachment.updateCoverOptions();
    }
    clearAttachment(e) {
        let attachment = e.detail;
        if (attachment.id === this.card.content.cover) {
            this.removeCover();
            this.card.element.removeCover();
        }
        // Check if attachment container needs to be hidden
        if (this.card.content.attachments.length > 0)
            this.shadowRoot.querySelector("#attachments").classList.remove("hide");
        else
            this.shadowRoot.querySelector("#attachments").classList.add("hide");
        // Update badge
        this.card.element.updateBadges();
    }
    // Move
    openMovePopOver(e) {
        let popover = document.createElement("kb-popover-card-move");
        popover.data = this.card;
        $("#base").appendChild( popover );
    }

    // Getters
    get htmlContent() {
        return `
<div id="cover" class="hide"></div>
<div id="banner-archive" class="hide">
    <span class="icon-lg mdi mdi-archive-outline"></span>
    <p>This card is archived.</p>
</div>
<div id="header">
    <div id="title-container">
        <span class="icon-lg mdi mdi-card-bulleted"></span>
        <div>
            <span id="title-text"></span>
            <kb-input id="title-input" class="hide" type="window-card-title" buttoncontrols="false" enterconfirm="true"></kb-input>
        </div>
    </div>
</div>
<div id="main">
    <div id="main-col">
        <div id="description">
            <div>
                <div class="section-header">
                    <span class="icon-lg mdi mdi-text-subject"></span>
                    <div>Description</div>
                </div>
                <div id="description-container">
                    <div id="description-content">
                        <div id="description-text">Add a more detailed description…</div>
                        <kb-input id="description-input" class="hide" confirmtext="Save" enterconfirm="false" placeholder="Add a more detailed description…"></kb-input>
                    </div>
                </div>
            </div>
        </div>
        <div id="attachments" class="hide">
            <div class="section-header">
                <span class="icon-lg mdi mdi-attachment"></span>
                <div>Attachments</div>
            </div>
            <div id="attachments-container">
                <slot name="attachments"></slot>
            </div>
        </div>
        <div id="checklists-container" class="hide">
            <slot name="checklists"></slot>
        </div>
    </div>
    <div id="sidebar">
        <div id="card-options">
            <button id="card-option-cover" class="card-option">
                <span class="icon-sm mdi mdi-dock-bottom"></span>
                <span class="card-option-text">Cover</span>
                <input id="card-option-cover-file" class="invisible" type="file">
                <label for="card-option-cover-file"></label>
            </button>
            <button id="card-option-checklist" class="card-option">
                <span class="icon-sm mdi mdi-check-all"></span>
                <!-- <span class="icon-sm mdi mdi-check-box-multiple-outline"></span> -->
                <span class="card-option-text">Checklist</span>
            </button>
            <button id="card-option-attachment" class="card-option">
                <span class="icon-sm mdi mdi-attachment"></span>
                <span class="card-option-text">Attachment</span>
            </button>
            <button id="card-option-move" class="card-option">
                <span class="icon-sm mdi mdi-arrow-right"></span>
                <span class="card-option-text">Move</span>
            </button>
            <hr>
            <button id="card-option-archive" class="card-option">
                <span class="icon-sm mdi mdi-archive-outline"></span>
                <span class="card-option-text">Archive</span>
            </button>
            <button id="card-option-restore" class="card-option hide">
                <span class="icon-sm mdi mdi-restore"></span>
                <span class="card-option-text">Send to board</span>
            </button>
            <button id="card-option-delete" class="card-option negative hide">
                <span class="icon-sm mdi mdi-minus"></span>
                <span class="card-option-text">Delete</span>
            </button>
        </div>
    </div>
</div>
        `;
    }

    get cssContent() {
        return `
#wrapper {
    width: 768px;
}
#cover {
    background-repeat: no-repeat;
    position: relative;
    background-size: contain;
    background-origin: content-box;
    background-position: center;
    background-color: transparent;
    background-image: url("null");
    width: 100%;
    height: 160px;
    padding: 0;
    margin: 0;
    cursor: pointer;
}
#cover:hover {
    opacity: .9;
}
#banner-archive {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 12px;
    background-color: #fdfae5;
    background-size: 14px 14px;
    background-image: linear-gradient(to bottom right, rgba(0,0,0,.05) 25%, transparent 0, transparent 50%, rgba(0,0,0,.05) 0, rgba(0,0,0,.05) 75%, transparent 0, transparent)
}
#banner-archive > span {
    color: var(--c-main-very-weak);
    margin: -3px 0;
}
#banner-archive > p {
    margin: 0 0 0 8px;
    font-size: 16px;
    line-height: 30px;
}
#header {
    margin: 12px 48px 12px 16px;
    min-height: 32px;
    position: relative;
    z-index: 1;
}

#title-container {
    width: 100%;
    min-height: 36px;
    display: flex;
    flex-flow: row nowrap;
}
#title-container > span {
    color: var(--c-main-weak);
    flex-shrink: 1;
}
#title-container > div {
    min-height: 36px;
    flex-grow: 1;
}
#title-text {
    cursor: pointer;
    overflow: hidden;
    overflow-wrap: break-word;
    min-height: 36px;
    width: calc(100% - 40px);
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    padding: 5px 8px 3px;
    display: block;
    color: var(--c-main);
    box-sizing: border-box;
}
#main {
    display: flex;
    flex-flow: row nowrap;
    padding: 16px;
}
#main-col {
    flex-grow: 1;
    padding-right: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
}
.section-header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 8px;
}
.section-header > span {
    color: var(--c-main-weak);
    margin-right: 8px;
}
.section-header > div {
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
}

/* Card Description */
#description {
    width: 100%;
    margin-bottom: 32px;
}
#description > div {
    display: flex;
    flex-flow: column nowrap;
}
#description-container {
}
#description-content {
    margin-left: 44px;
}
#description-text {
    cursor: pointer;
    width: 100%;
}
#description-text.empty {
    background-color: var(--c-gray-4);
    cursor: pointer;
    min-height: 56px;
    width: 100%;
    border-radius: var(--border-radius);
    padding: 8px 12px;
}
#description-text.empty:hover {
    background-color: var(--c-gray-8)
}
#description-text.empty:active {
    color: var(--c-focus);
    background-color: var(--c-focus-bg)
}
#description-input {
    min-height: 160px;
}

/* Sidebar */
#sidebar {
    flex-shrink: 1;
    padding-left: 8px;
}
#card-options {
    display: flex;
    flex-flow: column nowrap;
}
#card-options > hr {
    width: 100%;
    height: 1px;
    background-color: var(--c-gray-13);
    margin: 8px 0 0 0;
    border: 0;
}
.card-option {
    box-shadow: none;
    border: none;
    box-sizing: border-box;
    display: flex;
    height: 32px;
    width: 168px;
    margin-top: 8px;
    overflow: hidden;
    padding: 6px 12px;
    position: relative;
    text-overflow: ellipsis;
    user-select: none;
    white-space: nowrap;
    color: var(--c-main);
    background-color: var(--c-gray-4);
    text-align: left;
}
.card-option:hover {
    background-color: var(--c-gray-8);
    color: var(--c-main-strong);
}
.card-option > span {
    margin-right: 4px;
}
#card-option-cover > label::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    content: "";
    z-index: 0;
    cursor: pointer;
}

/* Attachments */
#attachments {
    margin-bottom: 24px;
}
#attachments-container {
    display: flex;
    flex-flow: column nowrap;
    margin-left: 44px;
}

/* Checklists */
#checklists-container {
    position: relative;
}
::slotted(kb-placeholder),
::slotted(kb-checklist) {
    margin-bottom: 24px;
}
        `;
    }
}

customElements.define( "kb-window-card", KbWindowCard );
