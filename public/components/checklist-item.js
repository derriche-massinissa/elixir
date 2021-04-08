"use strict";

class KbChecklistItem extends HTMLElement {
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
    set data(item) {
        this.virtual = item;
        item.element = this;

        // Add CSS and HTML
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild( this.styleIndex );
        this.shadowRoot.appendChild( this.styleIcons );
        this.shadowRoot.appendChild( this.styleComponent );
        this.shadowRoot.innerHTML += this.html;

        // Check
        if (this.virtual.checked) {
            this.shadowRoot.querySelector("#checkbox").checked = true;
            this.check();
        }

        // Events
        // Check
        this.shadowRoot.querySelector("#checkbox").onchange = () => { this.check(true) };
        // Edit
        this.shadowRoot.querySelector("#item-content").onclick = () => { this.edit() };
        this.shadowRoot.querySelector("#item-edit").addEventListener("edit-confirm", () => { this.saveEdit() });
        this.shadowRoot.querySelector("#item-edit").addEventListener("edit-cancel", () => { this.cancelEdit() });
        // Delete
        this.shadowRoot.querySelector("#delete-button").onclick = () => { this.deleteArm() };
        // Drag & Drop
        this.draggable = true;
        this.ondragstart = this.dragStart;
    }

    // Methods
    async check(active = false) {
        let checked = this.shadowRoot.querySelector("#checkbox").checked;

        if (checked)
            this.shadowRoot.querySelector("#item-content").classList.add("done");
        else
            this.shadowRoot.querySelector("#item-content").classList.remove("done");

        // Save
        if (active) await setData("item-check", this.virtual, checked);

        let evt;
        if (active)
            evt = new CustomEvent("item-checked", { 
                detail: this.virtual,
                bubbles: true
            });
        else
            evt = new CustomEvent("item-checked", { 
                bubbles: true
            });
        this.dispatchEvent(evt);
    }
    // Edit
    edit() {
        this.shadowRoot.querySelector("#content > .regular").classList.add("hide");
        this.shadowRoot.querySelector("#content > .edit").classList.remove("hide");
        this.shadowRoot.querySelector("#item-edit").value = this.virtual.content;
    }
    cancelEdit() {
        this.shadowRoot.querySelector("#content > .regular").classList.remove("hide");
        this.shadowRoot.querySelector("#content > .edit").classList.add("hide");
    }
    saveEdit() {
        if ( this.shadowRoot.querySelector("#item-edit").value === "")
            this.cancelEdit();
        else {
            let newContent = this.shadowRoot.querySelector("#item-edit").value;
            this.shadowRoot.querySelector("#item-content").innerText = newContent;
            this.shadowRoot.querySelector("#content > .regular").classList.remove("hide");
            this.shadowRoot.querySelector("#content > .edit").classList.add("hide");

            // Save new content
            setData("item-edit", this.virtual, newContent);
        }
    }
    // Delete
    deleteArm() {
        this.shadowRoot.querySelector("#delete-button").onclick = () => { this.delete() };
        this.shadowRoot.querySelector("#delete-button").classList.add("armed");
        this.onmouseleave = this.deleteDisarm;
    }
    deleteDisarm() {
        this.shadowRoot.querySelector("#delete-button").onclick = () => { this.deleteArm() };
        this.shadowRoot.querySelector("#delete-button").classList.remove("armed");
        this.onmouseleave = null;
    }
    async delete() {
        // Remove from data and server
        await setData("item-delete", this.virtual);

        // Anounce the deletion
        let evt = new Event("item-deleted", { bubbles: true });
        this.dispatchEvent(evt);

        // Remove DOM element
        this.remove();
    }
    // Completion animations
    celebrate(animation = "shake") {
        switch (animation) {
            case "shake":
                this.shake();
                break;
            case "pulse":
                this.pulse();
                break;
            case "wobble":
                this.wobble();
                break;
        }
    }
    shake() {
        let checkbox = this.shadowRoot.querySelector("#checkbox");
        checkbox.animate([
            // Keyframes
            { transform: 'rotate(13deg)' },
            { transform: 'rotate(-13deg)' },
            { transform: 'rotate(0deg)' }
        ], {
            // Timing options
            duration: 400,
            iterations: 1
        });
    }
    pulse() {
        let checkbox = this.shadowRoot.querySelector("#checkbox");
        checkbox.animate([
            // Keyframes
            { transform: 'scale(1.5)' },
            { transform: 'scale(1)' }
        ], {
            // Timing options
            duration: 500,
            iterations: 1
        });
    }
    wobble() {
        let checkbox = this.shadowRoot.querySelector("#checkbox");
        checkbox.animate([
            // Keyframes
            { transform: 'translateX(17%)' },
            { transform: 'translateX(-17%)' },
            { transform: 'translateX(0)' }
        ], {
            // Timing options
            duration: 400,
            iterations: 1
        });
    }
    // Drag & Drop ========== -Start- ==========
    dragStart(e) {
        e.preventDefault();

        this.fromChecklist = this.parentElement.virtual;
        this.fromPosition = indexInParent( this );
        let viewportOffset = this.getBoundingClientRect(),
            curTop = viewportOffset.top,
            curLeft = viewportOffset.left,
            curWidth = this.offsetWidth,
            curHeight = this.offsetHeight;

        // Create a placeholder
        let placeholder = document.createElement( "kb-placeholder" );
        placeholder.setAttribute( "id", "item-placeholder" );
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

        // Drag, End and Over events
        document.onmousemove = ((item) => {
            return (e) => {
                item.dragMove(e);
            };
        })(this);
        document.onmouseup = ((item) => {
            return (e) => {
                item.dragStop();
            };
        })(this);
        for (let checklist of this.virtual.parent.parent.content.checklists) {
            checklist.element.catchItem("catch");
            for (let item of checklist.items) {
                if (item.element !== this)
                    item.element.onmouseenter = item.element.dragOver;
            }
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
        let placeholder = document.getElementById("item-placeholder"),
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
        for (let checklist of this.virtual.parent.parent.content.checklists) {
            checklist.element.catchItem("stop");
            for (let item of checklist.items) {
                if (item.element !== this)
                    item.element.onmouseenter = null;
            }
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

        // Place the item
        let placeholder = document.getElementById("item-placeholder");
        placeholder.insertAdjacentElement( "beforebegin", this );
        placeholder.remove();

        // Save changes
        let toChecklist = this.parentElement.virtual,
            toPosition = indexInParent(this),
            toIndex;

        // Moved down in same list
        if (this.fromPosition < toPosition && toChecklist === this.fromChecklist) {
            let nextI = this.nextElementSibling;
            if (nextI !== null)
                toIndex = nextI.virtual.parent.items.indexOf(nextI.virtual) - 1;
            else
                toIndex = this.virtual.parent.items.length - 1;
        } // Moved up in same list OR Moved to another list
        else {
            let prevI = this.previousElementSibling;
            if (prevI !== null)
                toIndex = prevI.virtual.parent.items.indexOf(prevI.virtual) + 1;
            else
                toIndex = 0;
        }

        setData("item-move", this.virtual, toIndex, toChecklist);

        // Update progress bars
        let evt = new Event("item-moved", { bubbles: true });
        this.dispatchEvent(evt);
    }
    // Drag & Drop ========== --End-- ==========

    // Getters
    get html() {
        return `
<div id="container">
    <input id="checkbox" type="checkbox">
    <div id="content">
        <div class="regular">
            <span id="item-content">${this.virtual.content}</span>
            <button id="delete-button" class="icon-sm mdi mdi-close"></button>
        </div>
        <div class="edit hide">
            <kb-input id="item-edit" enterconfirm="true" confirmtext="Save"></kb-input>
        </div>
    </div>
</div>
        `;
    }

    get css() {
        return `
:host {
    display: block;
}
#container {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    background-color: transparent;
    cursor: pointer;
    user-select: none;
    border-radius: var(--border-radius);
}
#container:hover {
    background-color: var(--c-gray-4);
}
#checkbox {
    flex-shrink: 1;
    border-radius: 2px;
    box-sizing: border-box;
    min-width: 18px;
    width: 18px;
    height: 18px;
    overflow: hidden;
    line-height: 18px;
    background-color: var(--c-heavy-edit-bg);
    box-shadow: var(--focus-border);
    margin: 8px;
}
#content {
    /* margin: 7px 0; */
    flex-grow: 1;
    margin-left: 10px;
}

#content .regular {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
}
#item-content {
    flex-grow: 1;
    margin: 8px 0;
}
#item-content.done {
    opacity: 0.5;
    text-decoration: line-through;
}
#delete-button {
    flex-shrink: 1;
    min-width: 32px;
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius);
    margin-top: 2px;
    visibility: hidden;
}
#delete-button:hover {
    background-color: var(--c-gray-8);
}
#delete-button.armed {
    background-color: var(--c-btn-negative);
    color: var(--c-btn-negative-text);
}
#delete-button.armed:hover {
    background-color: var(--c-btn-negative-hover);
}
#container:hover #delete-button {
    visibility: visible;
}

#content .edit {
}
        `;
    }
}

customElements.define( "kb-checklist-item", KbChecklistItem );
