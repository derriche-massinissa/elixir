"use strict";

class KbPopoverCardMove extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;
    }

    connectedCallback() {
    }

    // Setters
    set data(card) {
        this.card = card;

        /*let noOtherArchived = this.card.parent.cards.filter( card =>
            !card.archived ||
            card === this.card
        );
        //this.currentPosition = noOtherArchived.indexOf( this.card );
        //console.log( this.card.parent.cards.indexOf( this.card ) );*/
        this.currentPosition =  this.card.parent.cards.indexOf( this.card );
        this.currentList = this.card.parent;
        this.currentBoard = this.card.parent.parent;

        this.selectedPosition = this.currentPosition;
        this.selectedList = this.currentList,
        this.selectedBoard = this.currentBoard;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML = this.htmlContent;

        // Title
        this.shadowRoot.querySelector("#title").innerText = "Move Card";

        // Set select contents
        this.updateBoards();
        this.updateLists();
        this.updatePositions();

        // Events
        this.shadowRoot.querySelector("#board-select").onchange = (e) => {
            this.boardSelected(e);
        };
        this.shadowRoot.querySelector("#list-select").onchange = (e) => {
            this.listSelected(e);
        };
        this.shadowRoot.querySelector("#position-select").onchange = (e) => {
            this.positionSelected(e);
        };
        this.shadowRoot.querySelector("#confirm-move").onclick = (e) => {
            this.moveCard(e);
        };
    }
    
    // Methods
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
            i++;
        }
    }
    updateLists() {
        this.shadowRoot.querySelector("#list-select > optgroup").innerHTML = "";
        if (this.selectedList === -1) {
            this.shadowRoot.querySelector("#list-destination > .value").innerHTML = "<i>No Lists</i>";
            this.shadowRoot.querySelector("#confirm-move").disabled = true;
        } else {
            this.shadowRoot.querySelector("#list-destination > .value").innerHTML = this.selectedList.title;
            this.shadowRoot.querySelector("#confirm-move").disabled = false;
            let i = -1;
            for (let list of this.selectedBoard.lists) {
                i++;
                if (list.archived) continue;
                let option = document.createElement("option");
                option.innerText = list.title;
                option.value = i;

                if (list === this.selectedList)
                    option.selected = true;

                if (list === this.currentList)
                    option.innerText += " (current)";

                this.shadowRoot.querySelector("#list-select > optgroup").appendChild(option);
            }
        }
    }
    updatePositions() {
        this.shadowRoot.querySelector("#position-select").innerHTML = "";
        if (this.selectedPosition === -1) {
            this.shadowRoot.querySelector("#position-destination > .value").innerHTML = "<i>N/A</i>";
        } else {
            let position = 0;
            for (let i = 0; i <= this.selectedList.cards.length; i++) {
                // Do not list an additional new position if the move is in the same list
                if (i === this.selectedList.cards.length && this.selectedList === this.currentList)
                    continue;
                // Do not count archived cards (Except current card)
                if (i < this.selectedList.cards.length) {
                    if (this.selectedList.cards[i].archived && this.selectedList.cards[i] !== this.card)
                        continue;
                }

                let option = document.createElement("option");
                option.innerText = position + 1;
                option.value = i;

                if (i === this.selectedPosition) {
                    option.selected = true;
                    this.shadowRoot.querySelector("#position-destination > .value").innerHTML = position + 1;
                }

                if (i === this.currentPosition && this.selectedList === this.currentList)
                    option.innerText += " (current)";

                this.shadowRoot.querySelector("#position-select").appendChild(option);
                position++;
            }
        }
    }
    boardSelected(e) {
        let boardIndex = parseInt( this.shadowRoot.querySelector("#board-select").value );
        this.selectedBoard = boardsData[boardIndex];
        if (this.selectedBoard.lists.length > 0) {
            this.selectedList = this.selectedBoard.lists[0];
            let noOtherArchived = this.selectedList.cards.filter( card =>
                !card.archived ||
                card === this.card
            );
            this.selectedPosition = noOtherArchived.length;
        } else {
            this.selectedList = -1;
            this.selectedPosition = -1;
        }

        this.updateBoards();
        this.updateLists();
        this.updatePositions();
    }
    listSelected(e) {
        let listIndex = parseInt( this.shadowRoot.querySelector("#list-select").value );
        this.selectedList = this.selectedBoard.lists[listIndex];
        let noOtherArchived = this.selectedList.cards.filter( card =>
            !card.archived ||
            card === this.card
        );
        if (this.selectedList === this.currentList)
            this.selectedPosition = noOtherArchived.length - 1;
        else
            this.selectedPosition = noOtherArchived.length;

        this.updateLists();
        this.updatePositions();
    }
    positionSelected(e) {
        let position = parseInt( this.shadowRoot.querySelector("#position-select").value );
        this.selectedPosition = position;

        this.updatePositions();
    }
    moveCard(e) {
        let index = this.shadowRoot.querySelector("#position-select").value;
        if (this.currentBoard !== this.selectedBoard)
            $("kb-window-card").close();
        console.log( index, this.selectedList, this.selectedBoard );
        this.card.element.move( index, this.selectedList, this.selectedBoard );
        this.close();
    }

    // Getters
    get htmlContent() {
        return `
<div id="prompt">Select Destination</div>
<div id="options">
    <div id="board-destination" class="button-link">
        <span class="label">Board</span>
        <span class="value">Current board</span>
        <select id="board-select">
            <optgroup label="Boards">
            </optgroup>
        </select>
    </div>
    <div id="list-destination" class="button-link">
        <span class="label">List</span>
        <span class="value">Current list</span>
        <select id="list-select">
            <optgroup label="Lists">
            </optgroup>
        </select>
    </div>
    <div id="position-destination" class="button-link">
        <span class="label">Position</span>
        <span class="value">Current position</span>
        <select id="position-select">
        </select>
    </div>
</div>
<button id="confirm-move" class="positive">Move</button>
        `;
    }

    get cssContent() {
        return `
#prompt {
    color: var(--c-main-very-weak);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: .04em;
    line-height: 16px;
    margin-top: 16px;
    text-transform: uppercase;
}
#options {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: 2.5fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: 102px;
    margin: 8px 0;
}
#options > div {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
}
#options > div > .label {
    color: var(--c-main-very-weak);
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 0;
    display: block;
}
#options > div > .value {
    overflow: hidden;
    text-overflow: ellipsis;
}
#options > div > select {
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
#board-destination {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
}
#list-destination {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
}
#position-destination {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
}
#confirm-move {
    padding: 6px 24px;
}
        `;
    }
}

customElements.define( "kb-popover-card-move", KbPopoverCardMove );
