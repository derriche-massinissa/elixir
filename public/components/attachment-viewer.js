"use strict";

class KbAttachmentViewer extends HTMLElement {
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

    connectedCallback() {
    }

    // Setters
    set data(attachment) {
        this.virtual = attachment.virtual;
        this.attachmentComponent = attachment;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Show media
        switch (this.virtual.type) {
            case "image": {
                let img = document.createElement("img");
                img.src = this.virtual.url;
                img.alt = this.virtual.name;
                this.shadowRoot.querySelector("#frame-view").appendChild(img);
            }   break;
            case "audio": {
                let audio = document.createElement("audio");
                audio.src = this.virtual.url;
                audio.name = this.virtual.name;
                audio.controls = true;
                this.shadowRoot.querySelector("#frame-view").appendChild(audio);
            }   break;
        }

        // Make/Remove cover
        if(this.virtual.type === "image") {
            if (this.virtual.id === this.virtual.parent.content.cover)
                    this.shadowRoot.querySelector(".remove-cover").classList.remove("hide");
            else
                    this.shadowRoot.querySelector(".make-cover").classList.remove("hide");
        }

        // Events
        // Close
        this.shadowRoot.querySelector("#close-button").onclick = () => { this.close() };
        // Cover
        this.shadowRoot.querySelector(".make-cover").onclick = () => { this.makeCover() };
        this.shadowRoot.querySelector(".remove-cover").onclick = () => { this.removeCover() };
        // Delete
        this.shadowRoot.querySelector(".delete").onclick = () => { this.askDelete() };
        this.shadowRoot.querySelector("#delete-link").onclick = () => { this.confirmDelete() };
        this.shadowRoot.querySelector("#cancel-link").onclick = () => { this.cancelDelete() };
    }

    // Methods
    close() {
        this.remove();
    }
    askDelete() {
        this.shadowRoot.querySelector(".regular").classList.add("hide");
        this.shadowRoot.querySelector(".confirm-delete").classList.remove("hide");
    }
    confirmDelete() {
        this.close();
        this.attachmentComponent.delete();
    }
    cancelDelete() {
        this.shadowRoot.querySelector(".regular").classList.remove("hide");
        this.shadowRoot.querySelector(".confirm-delete").classList.add("hide");
    }
    makeCover() {
        this.attachmentComponent.makeCover();
        this.shadowRoot.querySelector(".remove-cover").classList.remove("hide");
        this.shadowRoot.querySelector(".make-cover").classList.add("hide");
    }
    removeCover() {
        this.attachmentComponent.removeCover();
        this.shadowRoot.querySelector(".remove-cover").classList.add("hide");
        this.shadowRoot.querySelector(".make-cover").classList.remove("hide");
    }

    // Getters
    get html() {
        return `
<div id="attachment-viewer">
    <div id="content">
        <div id="underlay"></div>
        <div id="header">
            <button id="close-button">
                <span class="icon-lg mdi mdi-close"></span>
            </button>
        </div>
        <div id="frame">
            <div id="frame-view-wrapper">
                <div id="frame-view"></div>
            </div>
        </div>
        <div id="overlay">
            <div id="frame-details">
                <div id="frame-details-title">${this.virtual.name}</div>
                <div id="frame-details-info">${getAttachmentTime(this.virtual.timestamp)} - ${formatByteSize(this.virtual.size)}</div>
                <div id="frame-details-options">
                    <div class="regular">
                        <a class="option open" href="${this.virtual.url}" target="_blank" rel="noreferrer nofollow noopener">
                            <span class="icon-sm icon mdi mdi-arrow-top-right"></span>
                            Open in New Tab
                        </a>
                        <a class="option make-cover hide" href="#"><span class="icon-sm icon mdi mdi-dock-bottom"></span>
                            Make Cover
                        </a>
                        <a class="option remove-cover hide" href="#"><span class="icon-sm icon mdi mdi-dock-bottom"></span>
                            Remove Cover
                        </a>
                        <a class="option delete" href="#"><span class="icon-sm icon mdi mdi-close"></span>
                            Delete
                        </a>
                    </div>
                    <div class="confirm-delete hide">
                        Are you sure you want to delete? There is no undo.
                        <a id="delete-link" href="#">Delete forever.</a>
                        <a id="cancel-link" href="#">Never mind.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
        `;
    }

    get css() {
        return `
#attachment-viewer {
    color: var(--c-white);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    z-index: 100;
    display: flex;
    flex-flow: column nowrap;
}
#content {
    color: var(--c-white);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
}
#underlay {
    background-color: var(--c-black-70);
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 100px;
}
#header {
    position: relative;
    height: 48px;
    width: 100%;
    z-index: 40;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
}
#close-button {
}
#close-button > span {
    display: block;
    color: var(--c-white-60);
    padding: 6px;
}
#frame {
    flex-grow: 1;
    position: relative;
}
#frame-view-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
}
#frame-view {
    padding: 0 12px;
    width: 100%;
    height: auto;
    max-height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}
#frame-view > img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 100%;
    border-radius: var(--border-radius);
    object-fit: contain;
}
#overlay {
    height: 100px;
    width: 100%;
    background-color: var(--c-black-70);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
}
#frame-details {
    flex-grow: 1;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    padding: 12px 0;
}
#frame-details-title {
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    margin-bottom: 8px;
}
#frame-details-info {
    color: var(--c-white);
    margin-bottom: 8px;
}
#frame-details-options {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
}
#frame-details-options > .regular {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}
.option {
    text-decoration: underline;
    color: var(--c-white);
    display: flex;
    align-items: center;
}
.option:hover {
    color: var(--c-white);
}
.option > span {
    margin-right: 3px;
    text-decoration: none;
}
.option:not(:first-child) {
    margin-left: 14px;
}
#frame-details-options > .confirm-delete {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}
#frame-details-options > .confirm-delete > a {
    text-decoration: underline;
    color: var(--c-white);
    margin-left: 6px;
    display: block;
}
        `;
    }
}

customElements.define( "kb-attachment-viewer", KbAttachmentViewer );
