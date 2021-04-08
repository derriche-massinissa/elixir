"use strict";

class KbPopoverListMenu extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    // Setters
    set data(list) {
        this.list = list;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML = this.htmlContent;

        this.shadowRoot.querySelector("#title").innerText = "List Actions";

        // Events
        this.shadowRoot.querySelector("#move-list").onclick = () => { this.moveListDialog() };
        this.shadowRoot.querySelector("#archive-list").onclick = () => { this.archiveArm() };
    }

    // Methods
    // Move List
    moveListDialog() {
        this.shadowRoot.querySelector("#title").innerText = "Move List";
        this.shadowRoot.querySelector("#list-menu-container").innerHTML = this.shadowRoot.querySelector("#t-move-list").innerHTML;

        // Members
        this.currentPosition = this.list.parent.lists.indexOf( this.list );
        this.currentBoard = this.list.parent;
        this.selectedPosition = this.currentPosition;
        this.selectedBoard = this.currentBoard;

        // Set select contents
        this.updateBoards();
        this.updatePositions();

        // Events
        this.shadowRoot.querySelector("#board-select").onchange = (e) => { this.boardSelected(e) };
        this.shadowRoot.querySelector("#position-select").onchange = (e) => { this.positionSelected(e) };
        this.shadowRoot.querySelector("#confirm-move").onclick = (e) => { this.moveList(e) };
    }
    updateBoards() {
        this.shadowRoot.querySelector("#board-select > optgroup").innerHTML = "";
        this.shadowRoot.querySelector("#board-destination > .value").innerHTML = this.selectedBoard.title;
        let i = 0;
        for (let board of boardsData) {
            let option = document.createElement("option");
            option.innerText = board.title;
            option.value = i;

            if (board === this.selectedBoard)
                option.selected = true;

            if (board === this.currentBoard)
                option.innerText += " (current)";

            this.shadowRoot.querySelector("#board-select > optgroup").appendChild(option);
        this.shadowRoot.querySelector("#position-destination > .value").innerHTML = 1;
        this.selectedPosition = 0;
            i++;
        }
    }
    updatePositions() {
        this.shadowRoot.querySelector("#position-select").innerHTML = "";
        let position = 0;
        for (let i = 0; i <= this.selectedBoard.lists.length; i++) {
            // Do not list an additional new position if the move is in the same board
            if (i === this.selectedBoard.lists.length && this.selectedBoard === this.currentBoard)
                continue;
            if (i < this.selectedBoard.lists.length) {
                if (this.selectedBoard.lists[i].archived)
                    continue;
            }

            let option = document.createElement("option");
            option.innerText = position + 1;
            option.value = i;

            if (i === this.selectedPosition) {
                option.selected = true;
                this.shadowRoot.querySelector("#position-destination > .value").innerHTML = position + 1;
            }

            if (i === this.currentPosition && this.selectedBoard === this.currentBoard)
                option.innerText += " (current)";

            this.shadowRoot.querySelector("#position-select").appendChild(option);
            position++;
        }
    }
    boardSelected() {
        let boardIndex = parseInt( this.shadowRoot.querySelector("#board-select").value );
        this.selectedBoard = boardsData[boardIndex];
        this.selectedPosition = 0;

        this.updateBoards();
        this.updatePositions();
    }
    positionSelected() {
        let position = parseInt( this.shadowRoot.querySelector("#position-select").value );
        this.selectedPosition = position;

        this.updatePositions();
    }
    moveList() {
        this.list.element.move( this.selectedPosition, this.selectedBoard );
        this.close();
    }
    // Archive
    archiveArm() {
        this.shadowRoot.querySelector("#archive-list").onclick = () => { this.archive() };
        this.shadowRoot.querySelector("#archive-list").onmouseleave = () => { this.archiveDisarm() };
        this.shadowRoot.querySelector("#archive-list").classList.add("armed");
    }
    archiveDisarm() {
        this.shadowRoot.querySelector("#archive-list").onclick = () => { this.archiveArm() };
        this.shadowRoot.querySelector("#archive-list").onmouseleave = null;
        this.shadowRoot.querySelector("#archive-list").classList.remove("armed");
    }
    async archive() {
        this.close();
        this.list.element.archive();
    }


    // Getters
    get htmlContent() {
        return `
<div id="list-menu-container">
    <div id="home-content">
        <button id="move-list">Move List…</button>
        <hr>
        <button id="archive-list">Archive This List</button>
    </div>
</div>
<!-- Templates -->
<template id="t-move-list">
    <div id="move-list-content">
        <div id="board-destination" class="button-link">
            <span class="label">Board</span>
            <span class="value">Current board</span>
            <select id="board-select">
                <optgroup label="Boards">
                </optgroup>
            </select>
        </div>
        <div id="position-destination" class="button-link">
            <span class="label">Position</span>
            <span class="value">Current position</span>
            <select id="position-select">
            </select>
        </div>
        <button id="confirm-move" class="positive">Move</button>
    </div>
</template>
        `;
    }

    get cssContent() {
        return `
#home-content > button {
    display: block;
    width: 100%;
    color: var(--c-main);
    padding: 6px 12px;
    text-align: left;
}
#home-content > button:hover {
    color: var(--c-main-strong);
    background-color: var(--c-gray-8);
}
#archive-list.armed {
    background-color: var(--c-btn-negative);
    color: var(--c-btn-negative-text);
}
#archive-list.armed:hover {
    background-color: var(--c-btn-negative-hover);
    color: var(--c-btn-negative-text);
}

#move-list-content {
}
#move-list-content > .button-link {
    height: 50px;
    margin-bottom: 8px;
}
#move-list-content > .button-link > .label {
    color: var(--c-main-very-weak);
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 0;
    display: block;
}
#move-list-content > .button-link > .value {
    overflow: hidden;
    text-overflow: ellipsis;
}
#move-list-content > .button-link > select {
    border: none;
    margin: 0;
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    z-index: 0;
}
#move-list-content > #confirm-move {
    padding: 6px 24px;
}
        `;
    }
}

customElements.define( "kb-popover-list-menu", KbPopoverListMenu );
