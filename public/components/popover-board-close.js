"use strict";

class KbPopoverBoardClose extends KbPopover {
    constructor() {
        super();

        this.styleComponent.textContent += this.cssContent;

        this.type = "close";
    }

    // Setters
    set data(board) {
        this.board = board;

        this.setup();
        this.shadowRoot.querySelector("#body").innerHTML += this.htmlContent;

        // Content
        if (this.type === "close") {
            this.shadowRoot.querySelector("#title").innerText = this.closeTitle;
            this.shadowRoot.querySelector("p").innerText = this.closeText;
            this.shadowRoot.querySelector("button.confirm").innerText = this.closeButton;
        } else {
            this.shadowRoot.querySelector("#title").innerText = this.deleteTitle;
            this.shadowRoot.querySelector("p").innerText = this.deleteText;
            this.shadowRoot.querySelector("button.confirm").innerText = this.deleteButton;
        }

        // Events
        if (this.type === "close")
            this.shadowRoot.querySelector("button.confirm").onclick = () => { this.closeBoard() };
        else
            this.shadowRoot.querySelector("button.confirm").onclick = () => { this.deleteBoard() };
    }

    // Members
    closeTitle = "Close Board?";
    closeText = "You can re-open the board by clicking the “Boards” menu from the header, selecting “View Closed Boards,” finding the board and clicking “Re-open.”";
    closeButton = "Close";
    deleteTitle = "Delete Board?";
    deleteText = "All lists, cards and files will be deleted, and you won’t be able to re-open the board. There is no undo.";
    deleteButton = "Delete";

    // Methods
    async closeBoard() {
        $("kb-board").close();
        this.close();
    }
    async deleteBoard() {
        let boardElement = this.boardItem || $("kb-board");
        boardElement.delete();
        this.close();
    }

    // Getters
    get htmlContent() {
        return `
<p></p>
<button class="confirm negative"></button>
        `;
    }

    get cssContent() {
        return `
button.confirm {
    width: 100%;
    margin-top: 8px;
    padding: 6px 12px;
}
        `;
    }
}

customElements.define( "kb-popover-board-close", KbPopoverBoardClose );
