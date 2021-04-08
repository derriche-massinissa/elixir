"use strict";

class KbList extends HTMLElement {
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
    set data(list) {
        // Add a reference on both the DOM and virtual element
        this.virtual = list;
        list.element = this;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Title
        this.shadowRoot.querySelector("#header-title").textContent = this.virtual.title;

        // Events
        this.shadowRoot.querySelector("#menu-button").addEventListener( "click", (e) => { this.openMenu(e) } );
        this.shadowRoot.querySelector("#header-target").addEventListener( "click", (e) => { this.editTitle(e) } );
        this.shadowRoot.querySelector("#header-target").setAttribute( "draggable", "true" );
        this.shadowRoot.querySelector("#header-target").addEventListener( "dragstart", (e) => { this.dragStart(e) } );
        this.shadowRoot.addEventListener( "edit-cancel", () => { this.editTitleConfirm() } );
        this.shadowRoot.addEventListener( "edit-confirm", () => { this.editTitleConfirm() } );
        this.shadowRoot.addEventListener( "card-created", () => { this.createCard() } );
    }

    editTitle(e) {
        this.shadowRoot.querySelector("#header-title-edit").value = this.virtual.title;

        this.shadowRoot.querySelector("#header-target").style.display = "none";
        this.shadowRoot.querySelector("#header-title").style.display = "none";
        this.shadowRoot.querySelector("#header-title-edit").style.display = "block";

        this.shadowRoot.querySelector("#header-title-edit").resizeTextareaHeight();
        this.shadowRoot.querySelector("#header-title-edit").select();
    }

    editTitleConfirm() {
        let newTitle = this.shadowRoot.querySelector("#header-title-edit").value;
        this.shadowRoot.querySelector("#header-title").textContent = newTitle;
        setData( "list-title", this.virtual, newTitle );

        this.shadowRoot.querySelector("#header-target").style.display = "";
        this.shadowRoot.querySelector("#header-title").style.display = "";
        this.shadowRoot.querySelector("#header-title-edit").style.display = "";
    }

    openMenu(e) {
        let button = this.shadowRoot.querySelector("#menu-button"),
            height = button.offsetHeight,
            top = button.getBoundingClientRect().top,
            left = button.getBoundingClientRect().left,
            menu = document.createElement("kb-popover-list-menu");
        menu.data = this.virtual;
        menu.style.top = (top + height + 8) + "px";
        menu.style.left = left + "px";
        $("#base").appendChild( menu );
    }

    // Drag and Drop ========== -Start- ==========
    dragStart(e) {
        e.preventDefault();

        this.fromPosition = indexInParent( this );
        let viewportOffset = this.getBoundingClientRect(),
            curTop = viewportOffset.top,
            curLeft = viewportOffset.left,
            curHeight = this.shadowRoot.querySelector("#content").offsetHeight;

        // Create a placeholder
        let placeholder = document.createElement( "kb-placeholder" );
        placeholder.setAttribute( "id", "list-placeholder" );
        placeholder.height = curHeight;
        placeholder.minHeight = curHeight;
        placeholder.isList = true;
        this.insertAdjacentElement( "beforebegin", placeholder );

        // Reverse all of these when drag ends
        document.getElementById("base").appendChild( this );
        this.style.position = "absolute";
        this.style.margin = "0";
        this.style.zIndex = "9999";
        this.style.pointerEvents = "none";
        this.shadowRoot.querySelector("#content").style.boxShadow = "var(--shadow)";
        this.shadowRoot.querySelector("#content").style.transform = "rotate(4deg)";

        this.style.top = curTop + "px";
        this.style.left = curLeft + "px";

        this.pos = {};
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;

        // Events
        document.onmousemove = ((card) => {
            return (e) => {
                card.dragMove(e);
            };
        })(this);
        document.onmouseup = ((card) => {
            return (e) => {
                card.dragStop(e);
            };
        })(this);

        for (let list of boardsData[currentBoard].lists) {
            if (list.archived) continue;
            if (list.element !== this)
                list.element.addEventListener( "mouseenter", list.element.dragOver );
        }
    }

    dragMove(e) {
        // Calculate cursor's movement
        let movement = {};
        movement.x = this.pos.x - e.clientX;
        movement.y = this.pos.y - e.clientY;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        // Set the list's new position
        this.style.top = (this.offsetTop - movement.y) + "px";
        this.style.left = (this.offsetLeft - movement.x) + "px";
    }

    dragOver(e) {
        let placeholder = document.getElementById("list-placeholder"),
            idxP = indexInParent( placeholder ),
            idxL = indexInParent( this );

        if ( idxP < idxL ) {
            this.insertAdjacentElement( "afterend", placeholder );
        } else {
            this.insertAdjacentElement( "beforebegin", placeholder );
        }
    }

    dragStop(e) {
        // Clean events
        document.onmousemove = null;
        document.onmouseup = null;
        for (let list of boardsData[currentBoard].lists) {
            if (list.archived) continue;
            if (list.element !== this)
                list.element.removeEventListener( "mouseenter", list.element.dragOver );
        }

        // Clean style
        this.style.position = "";
        this.style.margin = "";
        this.style.zIndex = "";
        this.style.pointerEvents = "";
        this.shadowRoot.querySelector("#content").style.boxShadow = "";
        this.shadowRoot.querySelector("#content").style.transform = "";
        this.style.top = "";
        this.style.left = "";

        // Move list
        let placeholder = document.getElementById("list-placeholder");
        placeholder.insertAdjacentElement( "beforebegin", this );
        placeholder.remove();

        // Save changes
        let toPosition = indexInParent( this ),
            toIndex;
        // Moved right (Down)
        if (this.fromPosition < toPosition) {
            let nextL = this.nextElementSibling;
            if (nextL !== null && nextL.nodeName !== "KB-NEW-LIST")
                toIndex = nextL.virtual.parent.lists.indexOf(nextL.virtual) - 1;
            else
                toIndex = this.virtual.parent.lists.length - 1;
        } // Moved left (Up)
        else {
            let prevL = this.previousElementSibling;
            if (prevL !== null)
                toIndex = prevL.virtual.parent.lists.indexOf(prevL.virtual) + 1;
            else
                toIndex = 0;
        }

        setData( "list-move", this.virtual, toIndex );
    }
    // Card
    cardDragOver() {
        let placeholder = document.getElementById("card-placeholder");
        if (placeholder.parentElement !== this)
            this.appendChild( placeholder );
    }
    // Drag and Drop ========== --End-- ==========
    // Move
    async move(toIndex, toBoard = this.virtual.parent) {
        let fromIndex = this.virtual.parent.lists.indexOf( this.virtual ),
            fromBoard = this.virtual.parent;

        // Update DOM
        if (toBoard !== fromBoard)
            this.remove();
        else if (fromIndex < toIndex) {
            let position = "afterend", done = false;
            for (let i = toIndex; i < toBoard.lists.length; i++) {
                if (typeof toBoard.lists[i].element === "object" && toBoard.lists[i].element.isConnected) {
                    toBoard.lists[i].element.insertAdjacentElement(position, this);
                    done = true;
                    break;
                } else position = "beforebegin";
            }
            if (!done) $("kb-new-list").insertAdjacentElement("beforebegin", this);
        } else {
            let position = "beforebegin", done = false;
            for (let i = toIndex; i >= 0; i--) {
                if (typeof toBoard.lists[i].element === "object" && toBoard.lists[i].element.isConnected) {
                    toBoard.lists[i].element.insertAdjacentElement(position, this);
                    done = true;
                    break;
                } else position = "afterend";
            }
            if (!done) $("#board").prepend( this );
        }

        // Save changes
        await setData( 
            "list-move",
            this.virtual,
            toIndex,
            toBoard
        );
    }
    async createCard() {
        // Add card to data & server
        let title = this.shadowRoot.querySelector("kb-card-composer").value,
            dataRes = await setData( "card-create", this.virtual, title );

        let card = document.createElement( "kb-card" );
        card.data = dataRes.card;
        this.appendChild( card );
    }
    // Archive
    async archive() {
        this.remove();
        await setData("list-archive", this.virtual);
    }

    get html() {
        return `
<div id="container">
    <div id="content">
        <header>
            <div id="header-target"></div>
            <span id="header-title"></span>
            <kb-input id="header-title-edit" type="list-title" enterconfirm="true" buttoncontrols="false"></kb-input>
            <div id="header-extras">
                <button id="menu-button" class="icon-sm mdi mdi-dots-horizontal"></button>
            </div>
        </header>
        <div class="cards-container fancy-scrollbar">
            <slot></slot>
        </div>
        <kb-card-composer></kb-card-composer>
    </div>
</div>
        `;
    }

    get css() {
        return `
/* List */
#container {
    min-width: 272px;
    max-width: 272px;
    height: 100%;
    box-sizing: border-box;
    white-space: nowrap;
}
#content {
    --list-gap: 4px;
    background-color: var(--c-list);
    border-radius: var(--border-radius);
    display: flex;
    flex-flow: column nowrap;
    max-height: 100%;
}

/* Header */
header {
    flex: 0 0 auto;
    padding: 10px 36px 10px 8px;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}
#header-target {
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
}
#header-title {
    max-height: 256px;
    min-height: 20px;
    padding: 0 8px;
    font-weight: 600;
    max-width: 228px;
    white-space: break-spaces;
    word-wrap: break-word;
}
#header-title-edit {
    max-height: 256px;
    min-height: 20px;
    width: 228px;
    display: none;
    margin: -6px 0;
}
#header-extras {
    position: absolute;
    top: var(--list-gap);
    right: var(--list-gap);
    z-index: 20;
}
#header-extras > button {
    display: inline-block;
    padding: 6px;
    color: var(--c-main-very-weak-alt);
    box-sizing: content-box;
    cursor: pointer;
}
#header-extras > button:hover {
    background-color: var(--c-black-8);
    color: var(--c-main);
}

/* Content */
.cards-container {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column nowrap;
    padding: 0 var(--list-gap);
    margin: 0 var(--list-gap);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
}
::slotted(kb-card),
::slotted(kb-placeholder) {
    margin-bottom: 8px;
}
        `;
    }
}

customElements.define( "kb-list", KbList );
