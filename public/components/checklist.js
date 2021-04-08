"use strict";

class KbChecklist extends HTMLElement {
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


    // Setters
    set data(checklist) {
        this.virtual = checklist;
        checklist.element = this;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Fill with items
        for (let item of this.virtual.items) {
            this.addItem(item);
        }

        // Progress
        this.updateProgress();

        // Events
        // Title
        this.shadowRoot.querySelector("#title-text").onclick = (e) => { this.editTitle(e) };
        this.shadowRoot.querySelector("#header-content > .edit").addEventListener("edit-confirm", () => { this.saveTitle() });
        this.shadowRoot.querySelector("#header-content > .edit").addEventListener("edit-cancel", () => { this.cancelEditTitle() });
        // Delete
        this.shadowRoot.querySelector("#delete-button").onclick = (e) => { this.deleteAsk(e) };
        // Items
        this.shadowRoot.querySelector("#new-item > button").onclick = (e) => { this.newItem(e) };
        this.shadowRoot.querySelector("#new-item").addEventListener("edit-confirm", () => { this.createItem() });
        this.shadowRoot.querySelector("#new-item").addEventListener("edit-cancel", () => { this.cancelNewItem() });
        // Progress
        this.addEventListener("item-checked", this.updateProgress);
        this.addEventListener("item-deleted", this.updateProgress);
        // Drag & Drop
        this.shadowRoot.querySelector("#header").draggable = true;
        this.shadowRoot.querySelector("#header").ondragstart = (e) => { this.dragStart(e) };
    }

    // Methods
    editTitle(e) {
        this.shadowRoot.querySelector("#header-content > .regular").classList.add("hide");
        this.shadowRoot.querySelector("#header-content > .edit").classList.remove("hide");
        this.shadowRoot.querySelector("#title-edit").value = this.virtual.title;
        this.shadowRoot.querySelector("#title-edit").resizeTextareaHeight();
        this.shadowRoot.querySelector("#title-edit").select();
    }
    saveTitle() {
        let newTitle = this.shadowRoot.querySelector("#title-edit").value;
        if (newTitle === "") return;

        this.shadowRoot.querySelector("#title-text").innerText = newTitle;
        this.shadowRoot.querySelector("#header-content > .regular").classList.remove("hide");
        this.shadowRoot.querySelector("#header-content > .edit").classList.add("hide");

        setData("card-checklist-retitle", this.virtual, newTitle);
    }
    cancelEditTitle(e) {
        this.shadowRoot.querySelector("#header-content > .regular").classList.remove("hide");
        this.shadowRoot.querySelector("#header-content > .edit").classList.add("hide");
    }
    deleteAsk(e) {
        let popover = document.createElement("kb-popover-checklist-delete");
        popover.data = this.virtual;
        $("#base").appendChild(popover);
    }
    delete() {
        // Delete from the data object and server
        setData("card-checklist-delete", this.virtual);
        // Warn the card details window to update badges
        let evt = new Event("checklist-deleted", { bubbles: true });
        this.dispatchEvent(evt);
        // remove the DOM object
        this.remove();
    }
    // Items
    newItem(e) {
        this.shadowRoot.querySelector("#new-item > button").classList.add("hide");
        this.shadowRoot.querySelector("#new-item > kb-input").classList.remove("hide");
        this.shadowRoot.querySelector("#new-item > kb-input").value = "";
        this.shadowRoot.querySelector("#new-item > kb-input").resizeTextareaHeight();
        this.shadowRoot.querySelector("#new-item > kb-input").focus();
    }
    cancelNewItem() {
        this.shadowRoot.querySelector("#new-item > button").classList.remove("hide");
        this.shadowRoot.querySelector("#new-item > kb-input").classList.add("hide");
    }
    async createItem() {
        try {
            // Hide input
            this.shadowRoot.querySelector("#new-item > button").classList.remove("hide");
            this.shadowRoot.querySelector("#new-item > kb-input").classList.add("hide");

            let content = this.shadowRoot.querySelector("#new-item > kb-input").value,
                reponse = await setData("item-create", this.virtual, content);

            this.addItem(reponse.item);

            this.updateProgress();
            let evt = new Event("item-created", { bubbles: true } );
            this.dispatchEvent(evt);
        } catch (err) {
            console.error( err );
            throw err;
        }
    }
    addItem(item) {
        let itemComponent = document.createElement("kb-checklist-item");
        itemComponent.data = item;
        this.appendChild( itemComponent );
    }
    // Progress
    updateProgress(e) {
        let itemsCount = 0,
            checkedItemsCount = 0;
        for (let item of this.virtual.items) {
            itemsCount++;
            if (item.checked) checkedItemsCount++;
        }
        let pct;
        if (itemsCount !== 0) pct = (checkedItemsCount / itemsCount) * 100;
        else pct = 0;
        this.shadowRoot.querySelector("#progress-bar").style.width = pct + "%";
        this.shadowRoot.querySelector("#progress-text").innerText = pct.toFixed(0) + "%";

        if (pct === 100) {
            this.shadowRoot.querySelector("#progress-bar").classList.add("complete");

            // Play a random animation on the checkboxes
            if (typeof e === "undefined" || typeof e.detail === "undefined" || e.detail === null) return;

            const animations = ["shake", "pulse", "wobble"],
                animation = animations[Math.floor( Math.random() * animations.length )],
                delay = 150;

            let startPoint = this.virtual.items.indexOf(e.detail),
                upPoint = startPoint - 1,
                downPoint = startPoint + 1,
                items = this.virtual.items;

            function waveUp() {
                if (upPoint < 0) return;
                items[upPoint].element.celebrate(animation);
                upPoint--;
                setTimeout(()=>{waveUp()}, delay);
            }
            function waveDown() {
                if (downPoint >= items.length) return;
                items[downPoint].element.celebrate(animation);
                downPoint++;
                setTimeout(()=>{waveDown()}, delay);
            }

            items[startPoint].element.celebrate(animation);
            setTimeout(() => {waveUp()}, delay);
            setTimeout(() => {waveDown()}, delay);

        } else
            this.shadowRoot.querySelector("#progress-bar").classList.remove("complete");
    }
    // Drag over of items
    catchItem(action = "stop") {
        if (action === "catch") {
            this.shadowRoot.querySelector("#items").onmouseenter = () => {
                let placeholder = document.getElementById("item-placeholder");
                if (placeholder.parentElement !== this)
                    this.appendChild( placeholder );
            };
        } else if (action === "stop") {
            this.shadowRoot.querySelector("#items").onmouseenter = null;
        }
    }
    // Drag and Drop ========== -Start- ==========
    dragStart(e) {
        e.preventDefault();

        let checklists = Array.from(
            this.parentElement.querySelectorAll("kb-checklist")
        );
        this.fromPosition = checklists.indexOf( this );
        let viewportOffset = this.getBoundingClientRect(),
            curTop = viewportOffset.top,
            curLeft = viewportOffset.left,
            curWidth = this.offsetWidth,
            curHeight = this.offsetHeight;

        // Create a placeholder
        let placeholder = document.createElement( "kb-placeholder" );
        placeholder.setAttribute( "id", "checklist-placeholder" );
        placeholder.setAttribute( "slot", "checklists" );
        placeholder.height = curHeight;
        placeholder.minHeight = curHeight;
        this.insertAdjacentElement( "beforebegin", placeholder );

        // Reverse all of these when drag ends
        document.getElementById("base").appendChild( this );
        this.style.position = "absolute";
        this.style.zIndex = "9999";
        this.style.pointerEvents = "none";
        this.style.backgroundColor = "var(--c-panel-3)";
        this.style.opacity = "0.8";
        this.style.width = curWidth + "px";
        // Update these when the pointer moves
        this.style.top = curTop + "px";
        this.style.left = curLeft + "px";

        this.pos = {};
        this.pos.y = e.clientY;

        document.onmousemove = ((checklist) => {
            return (e) => {
                checklist.dragMove(e);
            };
        })(this);
        document.onmouseup = ((checklist) => {
            return (e) => {
                checklist.dragStop();
            };
        })(this);
        for (let checklist of this.virtual.parent.content.checklists) {
            if (checklist.element !== this)
                checklist.element.onmouseenter = checklist.element.dragOver;
        }
    }
    dragMove(e) {
        // Calculate cursor's movement
        let movement = {};
        movement.y = this.pos.y - e.clientY;
        this.pos.y = e.clientY;
        // Set the item's new position
        this.style.top = (this.offsetTop - movement.y) + "px";
    }
    dragOver(e) {
        let placeholder = document.getElementById("checklist-placeholder"),
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
        for (let checklist of this.virtual.parent.content.checklists) {
            if (checklist.element !== this)
                checklist.element.onmouseenter = null
        }

        // Clean the temporary style
        this.style.position = "";
        this.style.zIndex = "";
        this.style.pointerEvents = "";
        this.style.backgroundColor = "";
        this.style.opacity = "";
        this.style.width = "";
        this.style.top = "";
        this.style.left = "";

        // Place the checklist
        let placeholder = document.getElementById("checklist-placeholder");
        placeholder.insertAdjacentElement( "beforebegin", this );
        placeholder.remove();

        // Save changes
        let checklists = Array.from(
            this.parentElement.querySelectorAll("kb-checklist")
        );
        let toPosition = checklists.indexOf( this ),
            toIndex;

        // Moved down
        if (this.fromPosition < toPosition) {
            let nextC = checklists[toPosition + 1] || null;
            if (nextC !== null)
                toIndex = nextC.virtual.parent.content.checklists.indexOf(nextC.virtual) - 1;
            else
                toIndex = this.virtual.parent.content.checklists.length - 1;
        } else { // Moved up
            let prevC = checklists[toPosition - 1] || null;
            if (prevC !== null)
                toIndex = prevC.virtual.parent.content.checklists.indexOf(prevC.virtual) + 1;
            else
                toIndex = 0;

        }

        setData("checklist-move", this.virtual, toIndex);
    }
    // Drag and Drop ========== --End-- ==========

    // Getters
    get html() {
        return `
<div id="header">
    <span class="icon-lg mdi mdi-check"></span>
    <div id="header-content">
        <div class="regular">
            <span id="title-text">${this.virtual.title}</span>
            <button id="delete-button">Delete</button>
        </div>
        <div class="edit hide">
            <kb-input id="title-edit" enterconfirm="true" confirmtext="Save"></kb-input>
        </div>
    </div>
</div>
<div id="progress">
    <span id="progress-text">0%</span>
    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>
</div>
<div id="items">
    <slot></slot>
</div>
<div id="new-item">
    <button>Add an item</button>
    <kb-input class="hide" enterconfirm="true" confirmtext="Add" placeholder="Add an item"></kb-input>
</div>
        `;
    }

    get css() {
        return `
:host {
    display: block;
}
/* Header */
#header {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    padding: 8px 0;
}
#header > span {
    flex-shrink: 1;
    color: var(--c-main-weak);
    margin-right: 8px;
}
#header-content {
    flex-grow: 1;
}
#header-content > .regular {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    /* padding: 8px 0; */
}
#title-text {
    flex-grow: 1;
    box-sizing: border-box;
    /* padding: 6px 0; */
    cursor: pointer;
    display: inline-block;
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    color: var(--c-main);
}
#header-content > .regular > button {
    flex-shrink: 1;
    padding: 6px 12px;
    background-color: var(--c-gray-4);
    color: var(--c-main);
    border: none;
    box-sizing: border-box;
    display: inline-block;
    margin-left: 8px;
}
#header-content > .regular > button:hover {
    background-color: var(--c-gray-8);
    color: var(--c-main-strong);
}
#hide-completed {
}
#delete-button {
}
#header-content > .edit {
}
#title-edit {
    width: 100%;
}

/* Progress */
#progress {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 8px;
}
#progress-text {
    flex-shrink: 1;
    padding: 0 8px;
    font-size: 11px;
    line-height: 11px;
    color: var(--c-main-very-weak);
}
#progress-container {
    flex-grow: 1;
    position: relative;
    background-color: var(--c-gray-8);
    border-radius: 4px;
    height: 8px;
    margin-left: 14px;
    overflow: hidden;
}
#progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0%;
    background-color: var(--c-progress-bar);
    transition: width .14s ease-in, background-color .14s ease-in;
}
#progress-bar.complete {
    background-color: var(--c-progress-bar-complete);
}

/* Add an item */
#new-item {
    margin: 8px 0 8px 44px;
}
#new-item > button {
    box-sizing: border-box;
    padding: 6px 12px;
    display: inline-block;
    background-color: var(--c-gray-4);
    color: var(--c-main);
    border-radius: var(border-radius);
}
#new-item > button:hover {
    background-color: var(--c-gray-8);
    color: var(--c-main-strong);
}

/* Items list */
#items {
    min-height: 8px;
}
        `;
    }
}

customElements.define( "kb-checklist", KbChecklist );
