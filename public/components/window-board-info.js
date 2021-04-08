"use strict";

class KbWindowBoardInfo extends KbWindow {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    connectedCallback() {
        this.setupWindow();
        this.shadowRoot.querySelector("#wrapper").innerHTML += this.htmlContent;

        // Set data
        let title = boardsData[currentBoard].title;
        this.shadowRoot.querySelector("#board-title .text").textContent = title;
        let description = boardsData[currentBoard].description;
        this.shadowRoot.querySelector("#board-description .text").innerText = description;

        // Events
        // Edit Title
        this.shadowRoot.querySelector("#board-title .text").onclick = () => { this.editTitle(); };
        // Edit Title Confirm
        this.shadowRoot.querySelector("#board-title").addEventListener( "edit-confirm", () => { this.editTitleConfirm() } );
        // Edit Title Cancel
        this.shadowRoot.querySelector("#board-title").addEventListener( "edit-cancel", () => { this.editTitleStop() } );
        
        // Edit Description
        this.shadowRoot.querySelector("#board-description .text").onclick = () => { this.editDescription(); };
        this.shadowRoot.querySelector("#board-description .bottom").onclick = () => { this.editDescription(); };
        // Edit Description Confirm
        this.shadowRoot.querySelector("#board-description").addEventListener( "edit-confirm", () => { this.editDescriptionConfirm() } );
        // Edit Description Cancel
        this.shadowRoot.querySelector("#board-description").addEventListener( "edit-cancel", () => { this.editDescriptionStop() } );
    }

    // Methods
    editTitle() {
        this.shadowRoot.querySelector("#board-title .edit kb-input").value = getData("board-title");
        this.shadowRoot.querySelector("#board-title .text").classList.add("hide");
        this.shadowRoot.querySelector("#board-title .edit").classList.remove("hide");
        this.shadowRoot.querySelector("#board-title .edit kb-input").select();
    }
    editTitleStop() {
        this.shadowRoot.querySelector("#board-title .text").classList.remove("hide");
        this.shadowRoot.querySelector("#board-title .edit").classList.add("hide");
    }
    editTitleConfirm() {
        let newTitle = this.shadowRoot.querySelector("#board-title .edit kb-input").value;
        setData( "board-title", newTitle );
        this.shadowRoot.querySelector("#board-title .text").textContent = newTitle;
        updateTitle();
        this.editTitleStop();
    }
    editDescription() {
        this.shadowRoot.querySelector("#board-description .edit kb-input").value = getData("board-description");
        this.shadowRoot.querySelector("#board-description .text").classList.add("hide");
        this.shadowRoot.querySelector("#board-description .bottom").classList.add("hide");
        this.shadowRoot.querySelector("#board-description .edit").classList.remove("hide");
        this.shadowRoot.querySelector("#board-description .edit kb-input").focus();
    }
    editDescriptionStop() {
        this.shadowRoot.querySelector("#board-description .text").classList.remove("hide");
        this.shadowRoot.querySelector("#board-description .bottom").classList.remove("hide");
        this.shadowRoot.querySelector("#board-description .edit").classList.add("hide");
    }
    editDescriptionConfirm() {
        let newDescription = this.shadowRoot.querySelector("#board-description .edit kb-input").value;
        setData( "board-description", newDescription );
        this.shadowRoot.querySelector("#board-description .text").innerText = newDescription;
        this.editDescriptionStop();
        updateDescription();
    }

    get htmlContent() {
        return `
<div id="board-title">
    <div class="text">Board Title</div>
    <div class="edit hide">
        <kb-input confirmtext="Save" enterconfirm="true" oneline="true" autoResize="none"></kb-input>
    </div>
</div>
<div id="board-description">
    <div class="text">Board Description</div>
    <div class="bottom">
        <a href="#">
            <span class="mdi mdi-lead-pencil"></span>
            Edit the board description.
        </a>
    </div>
    <div class="edit hide">
        <kb-input confirmtext="Save" autoResize="none"></kb-input>
    </div>
</div>
        `;
    }

    get cssContent() {
        return `
#wrapper {
    width: 500px;
}
/* Title */
#board-title {
    margin: 16px 48px 16px 16px;
}
#board-title .text {
    cursor: pointer;
    display: inline;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
}
#board-title .edit {
    display: block;
    width: 100%;
    box-sizing: border-box;
}
/* Title End */

/* Description */
#board-description {
    flex-grow: 1;
    padding: 8px 16px;
    display: flex;
    flex-flow: column nowrap;
}
#board-description .text {
    flex-grow: 1;
    min-height: 200px;
    cursor: pointer;
    word-break: break-word;
    overflow-wrap: break-word;
}
#board-description .bottom {
    color: var(--c-main-very-weak);
    display: block;
    margin: 2px 0;
    padding: 6px 12px;
    position: relative;
    user-select: none;
    border-radius: var(--border-radius);
    text-decoration: underline;
    cursor: pointer;
}
#board-description .bottom:hover {
    color: var(--c-main);
    background-color: var(--c-gray-8);
}
#board-description .edit {
    min-height: 200px;
    display: flex;
    flex-flow: column nowrap;
}
#board-description .edit kb-input {
    flex-grow: 1;
}
/* Description End */
        `;
    }
}

customElements.define( "kb-window-board-info", KbWindowBoardInfo );
