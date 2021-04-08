"use strict";

class KbAttachment extends HTMLElement {
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

    // Initialization
    set data (attachment) {
        // Add a reference on both the DOM and virtual element
        this.virtual = attachment;
        attachment.element = this;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Thumbnail
        if (this.virtual.type === "image") {
            this.shadowRoot.querySelector("#thumbnail").style.backgroundImage = `url(${this.virtual.url})`;
            this.shadowRoot.querySelector("#thumbnail").style.backgroundColor = this.virtual.color;
        } else if (this.virtual.type === "link") {
            this.shadowRoot.querySelector("#thumbnail-text").href = this.virtual.url;
            this.shadowRoot.querySelector("#thumbnail-text").classList.remove("hide");
        } else {
            this.shadowRoot.querySelector("#thumbnail-text").target = "";
            this.shadowRoot.querySelector("#thumbnail-text").classList.remove("hide");
        }
        let aDelete = this.shadowRoot.querySelector("#delete > a");
        if (this.virtual.type === "link") {
            aDelete.innerText = "Remove";
        } else {
            aDelete.innerText = "Delete";
        }

        // Cover
        this.updateCoverOptions();

        // Events
        if (this.virtual.type !== "link")
            this.shadowRoot.querySelector("#thumbnail").onclick = () => { this.viewAttachment() };
            this.shadowRoot.querySelector("#edit > a").onclick = () => { this.editAsk() };
        // Cover
            this.shadowRoot.querySelector("#make-cover").onclick = () => { this.makeCover() };
            this.shadowRoot.querySelector("#remove-cover").onclick = () => { this.removeCover() };
        // Delete
            this.shadowRoot.querySelector("#delete > a").onclick = () => { this.deleteAsk() };
    }

    // Methods
    viewAttachment() {
        let attachmentViewer = document.createElement( "kb-attachment-viewer" );
        attachmentViewer.data = this;
        $("#base").appendChild( attachmentViewer );
    }
    editAsk() {
        let popover = document.createElement("kb-popover-attachment-edit");

        popover.data = this.virtual;
        $("#base").appendChild(popover);
    }
    async edit(data) {
        // Update edit in data obj and server
        await setData( "card-attachment-edit", this.virtual, data );
        // Update element
        this.shadowRoot.querySelector("#name").innerText = data.name;
    }
    updateCoverOptions() {
        if (this.virtual.type !== "image") return;
        this.shadowRoot.querySelector("#cover-options").classList.remove("hide");
        if (this.virtual.id === this.virtual.parent.content.cover) {
            this.shadowRoot.querySelector("#make-cover").classList.add("hide");
            this.shadowRoot.querySelector("#remove-cover").classList.remove("hide");
        } else {
            this.shadowRoot.querySelector("#make-cover").classList.remove("hide");
            this.shadowRoot.querySelector("#remove-cover").classList.add("hide");
        }
    }
    deleteAsk() {
        let popover = document.createElement("kb-popover-attachment-delete");
        if (this.virtual.type === "link")
            popover.type = "remove";
        else
            popover.type = "delete";

        popover.data = this;
        $("#base").appendChild(popover);
    }
    delete() {
        let evt = new CustomEvent("attachment-deleted", {
            detail: this.virtual,
            bubbles: true
        });
        this.dispatchEvent(evt);
        setData("card-attachment-delete", this.virtual);
        this.virtual.parent.element.updateBadges();
        this.remove();
    }
    async makeCover() {
        await this.virtual.parent.element.setCover(this.virtual);
        let evt = new CustomEvent("make-cover", {
            detail: this.virtual,
            bubbles: true
        });
        this.dispatchEvent(evt);
        this.updateCoverOptions();
    }
    async removeCover() {
        await this.virtual.parent.element.removeCover();
        let evt = new CustomEvent("remove-cover", {
            bubbles: true
        });
        this.dispatchEvent(evt);
        this.updateCoverOptions();
    }

    // Getters
    get html() {
        return `
<div id="attachment">
    <div id="thumbnail">
        <a id="thumbnail-text" class="hide" href="#" target="_blank" rel="noopener nofollow noreferrer">${this.virtual.type}</a>
    </div>
    <div id="details">
        <a id="name" href="${this.virtual.url}" target="_blank" rel="noopener nofollow noreferrer">${this.virtual.name}</a>
        <div id="options">
            <span id="time">${getAttachmentTime(this.virtual.timestamp)}</span>
            <span id="edit">
                <a>Edit</a>
            </span>
            <span id="delete">
                <a></a>
            </span>
        </div>
        <div id="cover-options" class="hide">
            <a id="make-cover" href="#">
                <span class="icon icon-sm mdi mdi-dock-bottom"></span>
                <span class="text">Make Cover</span>
            </a>
            <a id="remove-cover" href="#">
                <span class="icon icon-sm mdi mdi-dock-bottom"></span>
                <span class="text">Remove Cover</span>
            </a>
        </div>
    </div>
</div>
        `;
    }

    get css() {
        return `
#attachment {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 8px;
    border-radius: var(--border-radius);
    cursor: pointer;
}
#attachment:hover {
    background-color: var(--c-gray-4);
}
#thumbnail {
    background-image: url("null");
    background-color: var(--c-gray-4);
    background-position: 50%;
    background-size: contain;
    background-repeat: no-repeat;
    border-radius: var(--border-radius);
    height: 80px;
    width: 112px;
    flex-shrink: 1;
}
#thumbnail-text {
    display: block;
    line-height: 80px;
    width: 100%;
    height: 100%;
    color: var(--c-main-very-weak);
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    text-align: center;
}
#details {
    flex-grow: 1;
    margin-left: 16px;
    padding: 8px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
}
#name {
    font-weight: 700;
    word-wrap: break-word;
    width: max-content;
}
#options {
    margin-bottom: 8px;
}
#options > span {
    color: var(--c-main-very-weak);
}
#options > span:not(:first-child)::before {
    content: " - ";
}
#options > span > a {
    text-decoration: underline;
    color: var(--c-main-very-weak);
    cursor: pointer;
}
#options > span > a:hover {
    color: var(--c-main);
}
#cover-options {
    display: flex;
    flex-flow: column nowrap;
    width: max-content;
}
#cover-options > a {
    display: flex;
    flex-flow: row nowrap;
}
#cover-options > a:hover > span {
    color: var(--c-main);
}
#cover-options .icon {
    display: inline-block;
    margin-right: 4px;
    color: var(--c-main-weak);
}
#cover-options .text {
    display: inline-block;
    text-decoration: underline;
    color: var(--c-main-very-weak);
}
        `;
    }
}

customElements.define("kb-attachment", KbAttachment);
