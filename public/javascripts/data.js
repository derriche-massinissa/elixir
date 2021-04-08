"use strict";

// In this file are all functions responsible for working with the virtual objects

async function setData (action, ...options) {
    let dataResponse = {};
    switch (action) {
        // Boards
        case "board-create": {  // Options: title, backgroundType, background
            let title = options[0],
                backgroundType = options[1],
                backgroundValue = options[2];

            // Title ; Bg Type ; Bg Value
            let res = await sendToServer( "board-create", title, backgroundType, backgroundValue );

            let boardData = {
                id: res.id,
                title: title,
                description: "",
                background: {
                    type: backgroundType,
                    value: backgroundValue
                },
                starred: false,
                closed: false,
                create_time: res.create_time,
                lists: []
            };

            if (boardData.background.type === "image")
                boardData.background.value = res.imageUrl;

            boardsData.push( boardData );

            dataResponse.board = boardData
        }   break;
        case "board-title": {  // Options: title
            boardsData[currentBoard].title = options[0];
            updateTitle();
            // Board ID ; Board Title
            sendToServer( "board-title", boardsData[currentBoard].id, options[0] );
        }   break;
        case "board-description": {  // Options: description
            boardsData[currentBoard].description = options[0];
            // Board ID ; Description
            sendToServer( "board-description", boardsData[currentBoard].id, options[0] );
        }   break;
        case "board-star": {    // Options: boolean
            //boardsData[currentBoard].starred = options[0];
            let board =  $("kb-board").virtual;
            board.starred = options[0];
            // Board ID ; Boolean
            await sendToServer( "board-star", board.id, options[0] );
        }   break;
        case "board-background-color": {  // Options: board, backgroundValue
            let board = options[0],
                bgValue = options[1];

            // Save to server
            let response = sendToServer( "board-background-color", board.id, bgValue );

            // Set data
            board.background.type = "color";
            board.background.value = bgValue;

            updateBackground( board );
        }   break;
        case "board-background-image": {    // Options: board, backgroundValue
            let board = options[0],
                bgValue = options[1];

            // Save to server
            let imageUrl = await updateBackgroundImage( board.id, bgValue );

            // Set data
            board.background.type = "image";
            board.background.value = imageUrl;

            updateBackground( board );
        }   break;
        case "board-close": {   // Options: board
            let board = options[0];

            // Set data
            board.closed = true;

            await sendToServer( "board-close", board.id );
        }   break;
        case "board-reopen": {   // Options: board
            let board = options[0];

            // Set data
            board.closed = false;

            await sendToServer( "board-reopen", board.id );
        }   break;
        case "board-delete": {
            let board = options[0];

            // Remove from data
            boardsData.splice(
                boardsData.indexOf(board),
                1
            );

            await sendToServer( "board-delete", board.id );
        }   break;

        // Lists
        case "list-create": {   // Options: title
            // Get previous node (Last list/Board)
            let title = options[0],
                board = boardsData[currentBoard],
                previousNode = board.lists[ board.lists.length - 1] || null;
            if (previousNode !== null) previousNode = previousNode.id;
            else previousNode = "_" + board.id;

            // Board | Previous List ID ; Title
            let res = await sendToServer( "list-create", previousNode, title );

            // Data object
            let listData = {
                    id: res.id,
                    title: title,
                    archived: false,
                    parent: board,
                    element: null,
                    cards: []
            };

            board.lists.push( listData );
            dataResponse.list = listData;
        }   break;
        case "list-title": {   // Options: list, title
            options[0].title = options[1];
            // List ID ; List Title
            sendToServer( "list-title", options[0].id, options[1] );
        }   break;
        case "list-move": {     // Options: list, toIdx, toBoard
            let list = options[0],
                toIndex = options[1],
                toBoard = (options[2] === null || typeof options[2] === "undefined") ? list.parent : options[2];
            if (toIndex === null) return;

            // Data object
            toBoard.lists.splice( 
                toIndex, 
                0, 
                list.parent.lists.splice(
                    list.parent.lists.indexOf(list),
                    1
                )[0]
            );

            let previousNode = (toBoard.lists[toIndex - 1] || null);
            if (previousNode === null) previousNode = "_" + toBoard.id;
            else previousNode = previousNode.id;

            // List ID ; Previous ID
            await sendToServer( "list-move", list.id, previousNode );

            // Update parent
            list.parent = toBoard;
        }   break;
        case "list-archive": {
            let list = options[0];

            list.archived = true;
            await sendToServer( "list-archive", list.id );
        }   break;
        case "list-restore": {
            let list = options[0];

            list.archived = false;
            await sendToServer( "list-restore", list.id );
        }   break;

        // Cards
        case "card-create": {   // Options: list, title
            let list = options[0],
                title = options[1];

            // Get previous node (Last card/List)
            let previousNode = list.cards[list.cards.length-1] || null;
            if (previousNode !== null) previousNode = previousNode.id;
            else previousNode = "_" + list.id;

            // List | Previous Card ID ; Title
            let res = await sendToServer ( "card-create", previousNode, title );

            // Data object
            let cardData = {
                id: res.id,
                archived: false,
                element: null,
                title: title,
                parent: list,
                create_time: res.create_time,
                content: {
                    cover: null,
                    description: "",
                    attachments: [],
                    checklists: []
                }
            };

            list.cards.push(cardData);
            dataResponse.card = cardData;
        }   break;
        case "card-move": {     // Options: card, toIdx, toList
            let card = options[0],
                toIndex = options[1],
                toList = (options[2] === null || typeof options[2] === "undefined") ? card.parent : options[2];
            if (toIndex === null) return;

            // Object data
            toList.cards.splice(
                toIndex,
                0,
                card.parent.cards.splice(
                    card.parent.cards.indexOf(card),
                    1
                )[0]
            );

            let previousNode = (toList.cards[toIndex - 1] || null);
            if (previousNode === null) previousNode = "_" + toList.id;
            else previousNode = previousNode.id;

            // Card ID ; Previous ID
            await sendToServer( "card-move", card.id, previousNode );

            // Update parent
            card.parent = toList;
        }   break;
        case "card-title-edit": { // Options: cardId, title
            let card = options[0],
                newTitle = options[1];

            card.title = newTitle;
            sendToServer( "card-title-edit", card.id, newTitle );
        }   break;
        case "card-description-edit": { // Options: cardId, title
            let card = options[0],
                newDescription = options[1];

            card.content.description = newDescription;
            sendToServer( "card-description-edit", card.id, newDescription );
        }   break;
        case "card-archive": {
            let card = options[0];

            card.archived = true;
            await sendToServer( "card-archive", card.id );
        }   break;
        case "card-restore": {
            let card = options[0];

            card.archived = false;
            await sendToServer( "card-restore", card.id );
        }   break;
        case "card-delete": {
            let card = options[0];

            let index = card.parent.cards.indexOf(card);
            card.parent.cards.splice(index, 1);

            sendToServer( "card-delete", card.id );
        }   break;

        // Checklists
        case "card-checklist-create": {    // Options: card, title
            let card = options[0],
                title = options[1];

            // Get previous node (Last checklist/Card)
            let previousNode = card.content.checklists[ card.content.checklists.length - 1] || null;
            if (previousNode !== null) previousNode = previousNode.id;
            else previousNode = "_" + card.id;

            // Card | Previous Checklist ID ; Title
            let res = await sendToServer ( "card-checklist-create", previousNode, title );

            // Data object
            let checklistData = {
                id: res.id,
                title: title,
                parent: card,
                items: []
            };

            card.content.checklists.push( checklistData );
            dataResponse.checklist = checklistData;
        }   break;
        case "card-checklist-retitle": { // Options: checklist, title
            let checklist = options[0],
                newTitle = options[1];

            checklist.title = newTitle;
            await sendToServer( "card-checklist-retitle", checklist.id, newTitle );
        }   break;
        case "checklist-move": {     // Options: checklist, toIndex
            let checklist = options[0],
                toIndex = options[1],
                card = checklist.parent;

            // Data object
            card.content.checklists.splice(
                toIndex,
                0,
                card.content.checklists.splice(
                    card.content.checklists.indexOf(checklist),
                    1
                )[0]
            );
                    
            let previousNode = (card.content.checklists[toIndex - 1] || null);
            if (previousNode === null) previousNode = "_" + card.id;
            else previousNode = previousNode.id;

            // Checklist ID ; Previous ID
            await sendToServer( "checklist-move", checklist.id, previousNode );
        }   break;
        case "card-checklist-delete": { // Options: checklist
            let checklist = options[0];

            // Deleting from the data object
            let idx = checklist.parent.content.checklists.indexOf(checklist);
            checklist.parent.content.checklists.splice(idx, 1);
            // Deleting from server
            await sendToServer( "card-checklist-delete", checklist.id );
        }   break;

        // Checklist Items
        case "item-create": { // Options: checklist, content
            try {
                let checklist = options[0],
                    content = options[1];

                // Get previous node (Last item/Checklist)
                let previousNode = checklist.items[checklist.items.length - 1] || null;
                if (previousNode !== null) previousNode = previousNode.id;
                else previousNode = "_" + checklist.id;

                // Checklist | Previous Item ID ; Content
                let res = await sendToServer("item-create", previousNode, content);

                // Data object
                let itemData = {
                    id: res.id,
                    content: content,
                    parent: checklist,
                    checked: false
                };

                checklist.items.push(itemData);
                dataResponse.item = itemData;
            } catch (error) {
                console.error(error);
                throw error;
            }
        }   break;
        case "item-check": {    // Options: item, check boolean
            let item = options[0],
                checked = options[1];

            item.checked = checked;
            await sendToServer( "item-check", item.id, checked );
        }   break;
        case "item-edit": { // Options: item, content
            let item = options[0],
                content = options[1];

            item.content = content;
            await sendToServer( "item-edit", item.id, content );
        }   break;
        case "item-delete": {   // Options: item
            let item = options[0];

            // Deleting from the data object
            let idx = item.parent.items.indexOf(item);
            item.parent.items.splice(idx, 1);

            // Delete from server
            await sendToServer( "item-delete", item.id );
        }   break;
        case "item-move": {     // Options: item, toIndex, toChecklist
            let item = options[0],
                toIndex = options[1],
                toChecklist = (typeof options[2] === "undefined" || options[2] === null) ? item.parent : options[2];
            if (toIndex === null) return;

            // Data object
            toChecklist.items.splice( 
                toIndex,
                0,
                item.parent.items.splice(
                    item.parent.items.indexOf(item),
                    1
                )[0]
            );
            // Change the parent object
            item.parent = toChecklist;

            let previousNode = (toChecklist.items[toIndex - 1] || null);
            if (previousNode === null) previousNode = "_" + toChecklist.id;
            else previousNode = previousNode.id;

            sendToServer( "item-move", item.id, previousNode );
        }   break;

        // Attachments
        case "card-attachment-create": {    // Options: card, object
            try {
                let card = options[0],
                    object = options[1],
                    attachment = await uploadAttachment(card.id, object);

                // Check if the server returned an error
                if (typeof attachment.error !== "undefined")
                    throw new Error(`Server error: ${attachment.error}`);

                // Add the attachment to the data object
                let attachmentObj = {
                    id: attachment.id,
                    name: attachment.name,
                    url: attachment.url,
                    card: attachment.card,
                    color: attachment.color,
                    timestamp: attachment.timestamp,
                    type: attachment.type,
                    size: attachment.size,
                    parent: card
                };
                card.content.attachments.unshift( attachmentObj );
                dataResponse.attachment = attachmentObj;
            } catch (error) {
                console.error( error );
                throw error;
            }
        }   break;
        case "card-attachment-add": {    // Options: cardIdx, listIdx, attachmentObject
            let cardIdx = options[0],
                listIdx = options[1],
                attachment = options[2],
                cardObj = boardsData[currentBoard].lists[listIdx].cards[cardIdx];

            let attachmentObj = {
                id: attachment.id,
                name: attachment.name,
                url: attachment.url,
                card: attachment.card,
                color: attachment.color,
                timestamp: attachment.timestamp,
                type: attachment.type,
                size: attachment.size,
                parent: cardObj
            };
            cardObj.content.attachments.unshift( attachmentObj );

            dataResponse.attachment = attachmentObj;
        }   break;
        case "card-attachment-edit": { // Options: attachment
            let attachment = options[0],
                newName = options[1].name;

            attachment.name = newName;

            await sendToServer( "card-attachment-edit", attachment.id, newName );
        }   break;
        case "card-attachment-delete": { // Options: attachment
            let attachment = options[0],
                attachmentsArray = attachment.parent.content.attachments,
                attachmentIdx = attachmentsArray.indexOf( attachment );
            if ( attachmentIdx > -1 ) {
                attachmentsArray.splice(attachmentIdx, 1);
            }

            await sendToServer( "card-attachment-delete", attachment.id );
        }   break;

        // Covers
        case "card-cover-set": {    // Options: attachmentObj
            /*let cardIdx = options[0],
                listIdx = options[1],*/
            let attachment = options[0];

            await sendToServer( "card-cover-set", attachment.card, attachment.id );
            attachment.parent.content.cover = attachment.id;
            //boardsData[currentBoard].lists[listIdx].cards[cardIdx].content.cover = attachment.id;
        }   break;
        case "card-cover-remove": { // Options: card
            let card = options[0];

            await sendToServer( "card-cover-remove", card.id );
            card.content.cover = null;
        }   break;
    }

    return dataResponse;
}

async function getData (data, ...options) {
    let value = null;
    switch (data) {
        // Boards
        case "board-title": {
            value = boardsData[currentBoard].title;
        }   break;
        case "board-star": {
            let board =  $("kb-board").virtual;
            value = board.starred;
        }   break;
        case "board-description": {
            value = boardsData[currentBoard].description;
        }   break;
        case "closed-boards": {
            // Get all boards in an array
            let allBoards = new Map();
            for (let board of boardsData) {
                    allBoards.set( board.id, board );
            }

            // Get a list of ids
            let closedBoardsId = await getFromServer( "closed-boards" );
            let closedBoards = [];
            for (let boardId of closedBoardsId.boards) {
                closedBoards.push( allBoards.get(boardId) );
            }
            value = closedBoards;
        }   break;

        case "board-from-id": {
            value = boardsData.find(board => board.id === options[0]) || null;
        }   break;
        case "board-from-card-id": {
            let cardsData = [];
            for (let board of boardsData) {
                for (let list of board.lists) {
                    for (let card of list.cards) {
                        cardsData.push(card);
                    }
                }
            }
            value = cardsData.find(card => card.id === options[0]) || null;
            if (value !== null) value = value.parent.parent;
        }   break;
        case "card-from-id": {
            let cardsData = [];
            for (let board of boardsData) {
                for (let list of board.lists) {
                    for (let card of list.cards) {
                        cardsData.push(card);
                    }
                }
            }
            value = cardsData.find(card => card.id === options[0]);
        }   break;
        case "archived-cards": {
            let board = options[0];

            // Get all cards of this board in an array
            let allCards = new Map();
            for (let list of board.lists) {
                for (let card of list.cards) {
                    allCards.set( card.id, card );
                }
            }

            // Get a list of ids
            let archivedCardsId = await getFromServer( "archived-cards", board.id );
            let archivedCards = [];
            for (let cardId of archivedCardsId.cards) {
                archivedCards.push( allCards.get(cardId) );
            }
            value = archivedCards;
        }   break;
    }
    return value;
}
