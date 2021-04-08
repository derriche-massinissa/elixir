"use strict";

class KbCard extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow( {mode: "open"} );

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
    set data (card) {
        // Add a reference on both the DOM and virtual element
        this.virtual = card;
        card.element = this;

        // Add CSS and HTML
        this.root.innerHTML = "";
        this.root.appendChild( this.styleIndex );
        this.root.appendChild( this.styleIcons );
        this.root.appendChild( this.styleComponent );
        this.root.innerHTML += this.html;

        // Is archived
        if (this.virtual.archived) this.classList.add("archived");

        // Show cover if any
        if (typeof this.virtual.content.cover !== "undefined") {
            if (this.virtual.content.cover !== null) this.addCover();
        }

        // Badges
        this.updateBadges();

        // Events
        this.addEventListener( "dragstart", this.dragStart );
        this.addEventListener( "click", () => { this.openDetailsWindow() } );
        this.shadowRoot.querySelector("#container").onclick = () => { return false; };
    }

    // Methods
    openDetailsWindow() {
        let detailsWindow = document.createElement("kb-window-card")
        detailsWindow.card = this.virtual;
        $("#base").appendChild( detailsWindow );
    }
    // Checklists
    async createChecklist(title) {
        try {
            // Upload and save the checklist
            let checklist = await setData("card-checklist-create", this.virtual, title);

            // Update badge count
            this.updateBadges();

            return checklist;
        } catch (err) {
            console.error( err );
            throw err;
        }
    }
    // Attachments
    async createAttachment(obj) {
        try {
            // Upload and save the attachment
            let attachment = await setData("card-attachment-create", this.virtual, obj);

            // Update badge count
            this.updateBadges();

            return attachment;
        } catch (err) {
            console.error( err );
            throw err;
        }
    }
    // Cover
    addCover() {
        let coverId = this.virtual.content.cover,
            coverAttachment = this.virtual.content.attachments.find( attachment => attachment.id === coverId ),
            cover = this.shadowRoot.querySelector("#cover");

        $("img", cover).src = coverAttachment.url;
        cover.style.backgroundColor = coverAttachment.color;
        cover.classList.remove("hide");
    }
    async setCover(attachment) {
        // Save to virtual element & server
        await setData( "card-cover-set", attachment );

        this.addCover();
    }
    async removeCover() {
        let cover = this.shadowRoot.querySelector("#cover");

        cover.classList.add("hide");
        $("img", cover).removeAttribute("src");
        cover.style.backgroundColor = "";

        // Remove from virtual element & server
        await setData( "card-cover-remove", this.virtual );
    }
    // Badges
    updateBadges() {
        let badges = this.shadowRoot.querySelector("#badges-container"),
            hideBadges = true;

        // Description
        if (typeof this.virtual.content.description !== "undefined") {
            if (this.virtual.content.description !== "" && this.virtual.content.description !== null) {
                hideBadges = false;
                $(".badge.description", badges).classList.remove("hide");
            } else
                $(".badge.description", badges).classList.add("hide");
        }

        // Attachments
        if (typeof this.virtual.content.attachments !== "undefined") {
            if (this.virtual.content.attachments.length > 0) {
                hideBadges = false;
                $(".badge.attachments", badges).classList.remove("hide");
                $(".badge.attachments > .badge-text", badges).textContent = this.virtual.content.attachments.length;
            } else {
                $(".badge.attachments", badges).classList.add("hide");
            }
        }

        // Checklist items
        if (typeof this.virtual.content.checklists !== "undefined") {
            if (this.virtual.content.checklists.length > 0) {
                hideBadges = false;

                let itemsCount = 0,
                    checkedItemsCount = 0;
                for (let checklist of this.virtual.content.checklists) {
                    for (let item of checklist.items) {
                        itemsCount++;
                        if (item.checked) checkedItemsCount++;
                    }
                }
                $(".badge.checklist-items > .badge-text", badges).textContent = `${checkedItemsCount}/${itemsCount}`;

                if (checkedItemsCount === itemsCount)
                    $(".badge.checklist-items", badges).classList.add("complete");
                else
                    $(".badge.checklist-items", badges).classList.remove("complete");

                if (itemsCount > 0)
                    $(".badge.checklist-items", badges).classList.remove("hide");
                else
                    $(".badge.checklist-items", badges).classList.add("hide");
            }
        }

        if (hideBadges) badges.classList.add("hide");
        else badges.classList.remove("hide");
    }
    // Drag and Drop ========== -Start- ==========
    dragStart(e) {
        e.preventDefault();

        if (this.parentElement.nodeName !== "KB-LIST") return;

        this.fromList = this.parentElement.virtual;
        this.fromPosition = indexInParent( this );

        let viewportOffset = this.getBoundingClientRect(),
            curTop = viewportOffset.top,
            curLeft = viewportOffset.left,
            curWidth = this.offsetWidth,
            curHeight = this.offsetHeight;

        // Create a placeholder
        let placeholder = document.createElement( "kb-placeholder" );
        placeholder.setAttribute( "id", "card-placeholder" );
        placeholder.height = curHeight;
        placeholder.minHeight = curHeight;
        this.insertAdjacentElement( "beforebegin", placeholder );

        // Reverse all of these when drag ends
        document.getElementById("base").appendChild( this );
        this.style.position = "absolute";
        this.style.zIndex = "9999";
        this.style.pointerEvents = "none";
        this.style.transform = "rotate(4deg)";
        this.style.width = curWidth + "px";
        this.style.boxShadow = "var(--shadow)";
        // Update these when the pointer moves
        this.style.top = curTop + "px";
        this.style.left = curLeft + "px";

        this.pos = {};
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;

        // Drag, End and Over events
        document.onmousemove = ((card) => {
            return (e) => {
                card.dragMove(e);
            };
        })(this);
        document.onmouseup = ((card) => {
            return (e) => {
                card.dragStop();
            };
        })(this);
        for (let list of boardsData[currentBoard].lists) {
            if (list.archived) continue;
            list.element.addEventListener( "mouseenter", list.element.cardDragOver );
            for (let card of list.cards) {
                if (card.archived) continue;
                if (card.element !== this)
                    card.element.addEventListener( "mouseenter", card.element.dragOver );
            }
        }
    }
    dragMove(e) {
        // Calculate cursor's movement
        let movement = {};
        movement.x = this.pos.x - e.clientX;
        movement.y = this.pos.y - e.clientY;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        // Set the card's new position
        this.style.top = (this.offsetTop - movement.y) + "px";
        this.style.left = (this.offsetLeft - movement.x) + "px";
    }
    dragOver(e) {
        let placeholder = document.getElementById("card-placeholder"),
            idxP = indexInParent( placeholder ),
            idxT = indexInParent( this );
        if (idxP < idxT)
            this.insertAdjacentElement( "afterend", placeholder );
        else
            this.insertAdjacentElement( "beforebegin", placeholder );
    }
    dragStop(e) {
        // Clean event listeners
        document.onmousemove = null;
        document.onmouseup = null;
        for (let list of boardsData[currentBoard].lists) {
            if (list.archived) continue;
            list.element.removeEventListener( "mouseenter", list.element.cardDragOver );
            for (let card of list.cards) {
                if (card.archived) continue;
                if (card.element !== this)
                    card.element.removeEventListener( "mouseenter", card.element.dragOver );
            }
        }
        // Clean the temporary style
        this.style.position = "";
        this.style.zIndex = "";
        this.style.pointerEvents = "";
        this.style.transform = "";
        this.style.width = "";
        this.style.boxShadow = "";
        this.style.top = "";
        this.style.left = "";
        // Place the card
        let placeholder = document.getElementById("card-placeholder");
        placeholder.insertAdjacentElement( "beforebegin", this );
        placeholder.remove();

        // Save changes
        let toList = this.parentElement.virtual,
            toPosition = indexInParent( this ),
            toIndex = 0;
        // Moved down in same list
        if (this.fromPosition < toPosition && toList === this.fromList) {
            let nextC = this.nextElementSibling;
            if (nextC !== null)
                toIndex = nextC.virtual.parent.cards.indexOf(nextC.virtual) - 1;
            else
                toIndex = this.virtual.parent.cards.length - 1;
        } // Moved up in same list OR Moved to another list
        else {
            let prevC = this.previousElementSibling;
            if (prevC !== null)
                toIndex = prevC.virtual.parent.cards.indexOf(prevC.virtual) + 1;
            else
                toIndex = 0;
        }

        setData( "card-move", this.virtual, toIndex, toList );
    }
    // Drag and Drop ========== --End-- ==========
    // Move
    async move(toIndex, toList = this.virtual.parent, toBoard = this.virtual.parent.parent) {
        let fromIndex = this.virtual.parent.cards.indexOf( this.virtual ),
            fromList = this.virtual.parent,
            fromBoard = this.virtual.parent.parent;

        // Update DOM
        if (this.virtual.archived) {
            await this.restore();
            if ($("kb-window-card") !== null)
                $("kb-window-card").makeArchived(false);
        }
        if (toBoard !== fromBoard)
            this.remove();
        else if (toIndex >= toList.cards.length)
            toList.element.appendChild( this );
        else if (fromIndex < toIndex && fromList === toList) {
            let position = "afterend", done = false;
            for (let i = toIndex; i < toList.cards.length; i++) {
                if (typeof toList.cards[i].element === "object" && toList.cards[i].element.isConnected) {
                    toList.cards[i].element.insertAdjacentElement(position, this);
                    done = true;
                    break;
                } else position = "beforebegin";
            }
            if (!done) toList.element.appendChild( this );
        } else {
            let position = "beforebegin", done = false;
            for (let i = toIndex; i >= 0; i--) {
                if (typeof toList.cards[i].element === "object" && toList.cards[i].element.isConnected) {
                    toList.cards[i].element.insertAdjacentElement(position, this);
                    done = true;
                    break;
                } else position = "afterend";
            }
            if (!done) toList.element.prepend( this );
        }

        // Save changes
        await setData(
            "card-move",
            this.virtual,
            toIndex,
            toList
        );
    }
    // Archive
    async archive() {
        this.remove();
        this.classList.add("archived");
        await setData("card-archive", this.virtual);
    }
    // Restore
    async restore() {
        this.classList.remove("archived");
        this.removeAttribute("slot");

        if (!this.virtual.parent.archived) {
            let index = this.virtual.parent.cards.indexOf(this.virtual);
            let nextC = this.virtual.parent.element.children[index] || null;
            this.virtual.parent.element.insertBefore(this, nextC);
        }

        await setData("card-restore", this.virtual);
    }
    // Delete
    delete() {
        setData("card-delete", this.virtual);
    }

    // Setters
    set title(newTitle) {
        this.shadowRoot.querySelector("#title").innerText = newTitle;
        // Update data & server data
        setData( "card-title-edit", this.virtual, newTitle );
    }
    set description(newDescription) {
        setData( "card-description-edit", this.virtual, newDescription );
        this.updateBadges();
    }

    // Getters
    get html() {
        return `
<a id="container" href="/c/${this.virtual.id}" draggable="true">
    <div id="cover" class="hide">
        <img src="" alt="">
    </div>
    <div id="details">
        <div id="title">${this.virtual.title}</div>
        <div id="badges-container" class="hide">
            <div class="badge description hide" title="This card has a description.">
                <span class="icon-a mdi mdi-text-subject"></span>
            </div>
            <div class="badge attachments hide" title="Attachments">
                <span class="icon-a mdi mdi-attachment"></span>
                <span class="badge-text">${this.virtual.content.attachments.length || 0}</span>
            </div>
            <div class="badge checklist-items hide" title="Checklist items">
                <span class="icon-a mdi mdi-check"></span>
                <span class="badge-text">0</span>

            </div>
        </div>
    </div>
</a>
        `;
    }

    get css() {
        return `
:host {
    display: block;
}
#container {
    background-color: var(--c-panel-1);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-card);
    cursor: pointer;
    max-width: 300px;
    /* min-height: 32px; */
    position: relative;
    text-decoration: none;
    z-index: 0;
    display: flex;
    flex-flow: column nowrap;
}
#container:hover {
    background-color: var(--c-panel-3);
}
:host(.archived) #container {
    box-shadow: var(--shadow-archived-card);
}
#cover {
    background-color: transparent;
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: contain;
    user-select: none;
    max-height: 260px;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    overflow: hidden;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    height: auto;
}
#cover > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
#details {
    padding: 6px 8px;
    position: relative;
    z-index: 10;
    overflow: hidden;
    min-height: 20px;
}
#title {
    margin: 0;
    padding: 0;
    white-space: normal;
    word-wrap: break-word;
}
#badges-container {
    display: flex;
    flex-flow: row nowrap;
    margin-top: 4px;
}
.badge {
    color: var(--c-main-very-weak);
    margin-right: 4px;
    padding: 2px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}
.badge.complete {
    color: var(--c-white);
    background-color: var(--c-badge-complete);
    border-radius: var(--border-radius);
}
.badge > .badge-text {
    padding-left: 2px;
    padding-right: 4px;
    font-size: 12px;
}
        `;
    }
}

customElements.define( "kb-card", KbCard );
