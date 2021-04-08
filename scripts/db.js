"use strict";

const { Pool } = require( "pg" ),
    fs = require( "fs" ).promises;

// Takes an array of objects, group them by a property in a new object
function groupBy (array, key) {
    /* array.reduce( (accumulator, currentValue) => {
     *      // Operation, any modification on the accumulator is kept
     *      // and carried to the next array item
     * }, startingValue);
     */
    return array.reduce( (objectGroupedByKey, obj) => {
        const value = obj[key];
        objectGroupedByKey[value] = (objectGroupedByKey[value] || []).concat(obj);
        return objectGroupedByKey;
    }, {});
}

// Takes a linked list (array), return an sorted array
function mapSort(linkedList, id = "id") {
    let sortedList = [],
        map = new Map(),
        currentId = null;

    // Index the linked list by previous_id
    for (let i = 0; i < linkedList.length; i++) {
        let item = linkedList[i];
        if (item.previous_id === null) {
            // First item
            currentId = item[id];
            sortedList.push(item);
        } else {
            map.set(item.previous_id, i);
        }
    }

    // Get the item with a "previous_id" referencing the current item
    while (sortedList.length < linkedList.length) {
        let nextItem = linkedList[ map.get(currentId) ];
        sortedList.push( nextItem );
        currentId = nextItem[id];
    }

    return sortedList;
}

function newPool () {
    const pool = new Pool({
        user: "postgres",
        hose: "localhost",
        database: "elixir",
        password: "",
        port: "5432"
    });

    return pool;
}

async function getAll () {
    const pool = newPool();

    let data = [];

    try {
        // Get the data
        let boards = (await pool.query( "SELECT * FROM boards ORDER BY title" )).rows,
            listsDb = (await pool.query( "SELECT * FROM lists")).rows,
            cardsDb = (await pool.query( "SELECT * FROM cards")).rows,
            attachmentsDb = (await pool.query( "SELECT * FROM attachments ORDER BY creation_time DESC")).rows,
            checklistsDb = (await pool.query( "SELECT * FROM checklists")).rows,
            chacklistItemsDb = (await pool.query( "SELECT * FROM checklist_items")).rows,
            tmp;

        // Group arrays by parent
        let listsGrouped = groupBy(listsDb, "board_id"),
            cardsGrouped = groupBy(cardsDb, "list_id"),
            attachmentsGrouped = groupBy(attachmentsDb, "card_id"),
            checklistsGrouped = groupBy(checklistsDb, "card_id"),
            checklistItemsGrouped = groupBy(chacklistItemsDb, "checklist_id");

        // Sort arrays
        let lists = {}, cards = {}, attachments = {}, checklists = {}, checklistItems = {};
        for (let [board, listsArray] of Object.entries(listsGrouped)) {
            lists[board] = mapSort(listsArray, "list_id");
        }
        for (let [list, cardsArray] of Object.entries(cardsGrouped)) {
            cards[list] = mapSort(cardsArray, "card_id");
        }
        for (let [card, attachmentsArray] of Object.entries(attachmentsGrouped)) {
            // Attachments are sorted by creation time and are not moveable
            attachments[card] = attachmentsArray;
        }
        for (let [card, checklistsArray] of Object.entries(checklistsGrouped)) {
            checklists[card] = mapSort(checklistsArray, "checklist_id");
        }
        for (let [checklist, checklistItemsArray] of Object.entries(checklistItemsGrouped)) {
            checklistItems[checklist] = mapSort(checklistItemsArray, "item_id");
        }

        // Build the data object
        // Boards
        for (const board of boards) {
            let boardData = {
                id: board.board_id,
                title: board.title,
                description: board.description,
                starred: board.starred,
                closed: board.closed,
                background: {
                    type: board.background_type,
                    value: board.background_value
                },
                create_time: board.create_time,
                close_time: board.close_time,
                lists: []
            };

            // Lists
            for (const list of (lists[board.board_id] || [])) {
                let listData = {
                    id: list.list_id,
                    title: list.title,
                    archived: list.archived,
                    cards: []
                }

                // Get cards
                for (const card of (cards[list.list_id] || [])) {
                    let cardData = {
                        id: card.card_id,
                        title: card.title,
                        archived: card.archived,
                        create_time: card.create_time,
                        archive_time: card.archive_time,
                        content: {
                            description: card.description,
                            cover: card.cover_id,
                            attachments: [],
                            checklists: []
                        }
                    };

                    // Get attachments
                    for(const attachment of (attachments[card.card_id] || [])) {
                        let attachmentData = {
                            id: attachment.attachment_id,
                            url: attachment.url,
                            name: attachment.name,
                            card: attachment.card_id,
                            color: attachment.color,
                            timestamp: attachment.creation_time,
                            type: attachment.type,
                            size: attachment.size
                        };

                        cardData.content.attachments.push( attachmentData );
                    }

                    // Get checklists
                    for(const checklist of (checklists[card.card_id] || [])) {
                        let checklistData = {
                            id: checklist.checklist_id,
                            title: checklist.title,
                            card: checklist.card_id,
                            items: []
                        };

                        // Get checklist items
                        for(const item of (checklistItems[checklist.checklist_id] || [])) {
                            let itemData = {
                                id: item.item_id,
                                content: item.item_content,
                                checklist: item.checklist_id,
                                checked: item.checked
                            };

                            checklistData.items.push( itemData );
                        }

                        cardData.content.checklists.push( checklistData );
                    }

                    listData.cards.push( cardData );
                }

                boardData.lists.push( listData );
            }

            data.push( boardData );
        }

        return data;
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

async function get (request, ...options) {
    const pool = newPool();

    let response = {};

    try {
        switch (request) {
            case "board-of-card": { // Card Id
                let query = {
                    text: "SELECT board_id FROM lists INNER JOIN cards ON cards.list_id = lists.list_id WHERE card_id = $1",
                    values: [ options[0] ]
                }, { rows } = await pool.query( query );
                response.id = rows[0].board_id;
            }   break;
            case "card-count-file-attachments": { // Card Id
                let query = {
                    text: "SELECT count(*) FROM attachments WHERE card_id = $1 AND type != 'link'",
                    values: [ options[0] ]
                }, { rows } = await pool.query( query );
                response.count = rows[0].count;
            }   break;
            case "card-board": {
                let cardId = options[0];
                const query = {
                    text:  `SELECT board_id
                            FROM lists
                            WHERE list_id = (SELECT list_id FROM cards WHERE card_id = $1)`,
                    values: [ cardId ]
                }, { rows } = await pool.query( query );
                response = rows[0].board_id;
            }   break;
        }
    } catch (err) {
        console.error(err.stack);
    } finally {
        await pool.end();
    }

    return response;
}

async function getData(data) {
    const pool = newPool(),
        request = data.query,
        options = data.options;
    let response = {};

    try {
        switch (request) {
            case "board": { // Board Id
                let { rows } = await pool.query( `
                    SELECT * FROM boards WHERE board_id = $1`,
                    [ options[0] ]
                );
                response.board = rows[0];
            }   break;
            case "closed-boards": { // Board Id
                let { rows } = await pool.query( `
                    SELECT board_id FROM boards WHERE closed ORDER BY close_time DESC`
                );
                let boardArray = [];
                for (let boardRow of rows) {
                    boardArray.push( boardRow.board_id );
                }
                response.boards = boardArray;
            }   break;
            case "archived-cards": { // Board Id
                let { rows } = await pool.query( `
                    SELECT card_id FROM cards WHERE list_id in (SELECT list_id FROM lists WHERE board_id = $1) AND archived ORDER BY archive_time DESC`,
                    [ options[0] ]
                );
                let cardArray = [];
                for (let cardRow of rows) {
                    cardArray.push( cardRow.card_id );
                }
                response.cards = cardArray;
            }   break;
        }
    } catch (err) {
        console.error(err.stack);
    } finally {
        await pool.end();
    }

    return response;
}

async function setData (data) {
    const pool = newPool();
    let res = {};

    try {
        switch (data.action) {
            // Boards
            case "board-create": { // Board Title ; Bg Type ; Bg Value
                res = await _board_create(pool, data);
            }   break;
            case "board-title": { // Board ID ; Board Title
                await _board_title(pool, data);
            }   break;
            case "board-description": { // Board ID ; Description
                await _board_description(pool, data);
            }   break;
            case "board-star": { // Board ID ; Description
                await _board_star(pool, data);
            }   break;
            case "board-background-color": {
                await _board_background_color(pool, data);
            }   break;
            case "board-background-image": {
                await _board_background_image(pool, data);
            }   break;
            case "board-close": {
                await _board_close(pool, data);
            }   break;
            case "board-reopen": {
                await _board_reopen(pool, data);
            }   break;
            case "board-delete": {
                await _board_delete(pool, data);
            }   break;

            // Lists
            case "list-create": {
                res = await _list_create(pool, data);
            }   break;
            case "list-title": { // List ID ; List Title
                await _list_title(pool, data);
            }   break;
            case "list-move": {
                await _list_move(pool, data);
            }   break;
            case "list-archive": { // List ID
                await _list_archive(pool, data);
            }   break;
            case "list-restore": { // List ID
                await _list_restore(pool, data);
            }   break;

            // Cards
            case "card-create": {
                res = await _card_create(pool, data);
            }   break;
            case "card-title-edit": { // ID ; Card Title
                await _card_title_edit(pool, data);
            }   break;
            case "card-description-edit": { // ID ; Card Title
                await _card_description_edit(pool, data);
            }   break;
            case "card-move": {
                await _card_move(pool, data);
            }   break;
            case "card-archive": { // Card ID
                await _card_archive(pool, data);
            }   break;
            case "card-restore": { // Card ID
                await _card_restore(pool, data);
            }   break;
            case "card-delete": { // Card ID
                await _card_delete(pool, data);
            }   break;

            // Covers
            case "card-cover-set": { // Card ID ; Attachment ID
                await _card_cover_set(pool, data);
            }   break;
            case "card-cover-remove": { // Card ID
                await _card_cover_remove(pool, data);
            }   break;

            // Card Checklists
            case "card-checklist-create": { // Card ID ; Title
                res = await _checklist_create(pool, data);
            }   break;
            case "card-checklist-retitle": { // Card ID ; Title
                await _checklist_retitle(pool, data);
            }   break;
            case "checklist-move": { // List ID ; From Index, To Index
                await _checklist_move(pool, data);
            }   break;
            case "card-checklist-delete": { // Card ID ; Title
                await _checklist_delete(pool, data);
            }   break;

            // Card Checklist Items
            case "item-create": { // Checklist ID ; Content
                res = await _item_create(pool, data);
            }   break;
            case "item-check": { // Item ID ; Check Boolean
                await _item_check(pool, data);
            }   break;
            case "item-edit": { // Item ID ; Content
                await _item_edit(pool, data);
            }   break;
            case "item-move": { // Item ID ; Content
                await _item_move(pool, data);
            }   break;
            case "item-delete": { // Item ID
                await _item_delete(pool, data);
            }   break;

            // Card Attachments
            case "card-attachment-add": { // Card ID ; Url ; Name ; Color (Hex String)
                res = await _card_attachment_add(pool, data);
            }   break;
            case "card-attachment-setup": { // Id ; Url ; Name ; Color (Hex String)
                await _card_attachment_setup(pool, data);
            }   break;
            case "card-attachment-edit": { // Id ; Name
                await _card_attachment_edit(pool, data);
            }   break;
            case "card-attachment-delete": {
                await _card_attachment_delete(pool, data);
            }   break;
        }

        return res;
    } catch (err) {
        console.log( err.stack );
    } finally {
        await pool.end();
    }
}

// ============================
// Q U E R Y  F U N C T I O N S
// ============================

// Board Functions
// ===============
async function _board_create ( pool, data ) {
    let boardTitle = data.options[0],
        bgType = data.options[1],
        bgValue = data.options[2];
    const query = {
        text: "INSERT INTO boards (board_id, title, description, starred, background_type, background_value, closed, create_time, close_time) VALUES (DEFAULT, $1, NULL, FALSE, $2, $3, DEFAULT, DEFAULT, NULL) RETURNING board_id, create_time",
        values: [ boardTitle, bgType, bgValue ]
    };
    let { rows } = await pool.query( query ),
        boardId = rows[0].board_id,
        createTime = rows[0].create_time,
        dbResponse = { id: boardId, create_time: createTime };
    // If the background is an image, move it from the temporary folder
    if (bgType === "image") {
        try {
            let files = await fs.readdir( "./public/files/tmp/new_board_bg/" );
            let oldPath = "./public/files/tmp/new_board_bg/" + files[0],
                newPath = "./public/files/boards/" + boardId + "/" + files[0],
                newFolder = "./public/files/boards/" + boardId,
                imageUrl = "/files/boards/" + boardId + "/" + files[0];
            dbResponse.imageUrl = imageUrl;
            await fs.mkdir( newFolder );
            await fs.rename( oldPath, newPath )
                .then( console.log( "File successfuly moved from temporary folder!" ) );

            query.text = "UPDATE boards SET background_value = $1 WHERE board_id = $2";
            query.values = [ imageUrl, boardId ];
            await pool.query( query );
        } catch (err) {
            console.error( err );
        }
    }

    return dbResponse;
}
async function _board_title ( pool, data ) {
    const query = {
        text: "UPDATE boards SET title = $1 WHERE board_id = $2",
        values: [ data.options[1], data.options[0] ]
    };
    await pool.query( query );
}
async function _board_description ( pool, data ) {
    const query = {
        text: "UPDATE boards SET description = $1 WHERE board_id = $2",
        values: [ data.options[1], data.options[0] ]
    };
    await pool.query( query );
}
async function _board_star ( pool, data ) {
    const query = {
        text: "UPDATE boards SET starred = $1 WHERE board_id = $2",
        values: [ data.options[1], data.options[0] ]
    };
    await pool.query( query );
}
async function _board_background_color ( pool, data ) {
    // Board ID ; Background Value
    let boardId = data.options[0],
        bgValue = data.options[1];

    try {
        // Delete old files if any
        let bgPath = `./public/files/boards/${boardId}`;
        let fileEntries = await fs.readdir( bgPath );
        for (let file of fileEntries) {
            await fs.unlink( `${bgPath}/${file}` );
            console.log( "Deleted: ", file );
        }
        await fs.rmdir( bgPath );
    } catch (err) {
        if (err.code !== "ENOENT") console.error( err );
    }

    // Record change on the database
    try {
        await pool.query(
            "UPDATE boards SET background_type = 'color', background_value = $1 WHERE board_id = $2",
            [ bgValue, boardId ]
        );
    } catch (err) {
        console.error( err );
    }
}
async function _board_background_image ( pool, data ) {
    // Board ID ; Background Value
    let boardId = data.options[0],
        bgValue = data.options[1];

    try {
        await pool.query(
            "UPDATE boards SET background_type = 'image', background_value = $1 WHERE board_id = $2",
            [ bgValue, boardId ]
        );
    } catch (err) {
        console.error( err );
    }
}
async function _board_close ( pool, data ) {
    let boardId = data.options[0];

    await pool.query(
        "UPDATE boards SET closed = true, close_time = now() WHERE board_id = $1",
        [ boardId ]
    );
}
async function _board_reopen ( pool, data ) {
    let boardId = data.options[0];

    await pool.query(
        "UPDATE boards SET closed = false, close_time = NULL WHERE board_id = $1",
        [ boardId ]
    );
}
async function _board_delete ( pool, data ) {
    let boardId = data.options[0];

    // Delete cards (To remove files of attachments)
    let cards = (await pool.query(
        "SELECT card_id FROM cards WHERE list_id in (SELECT list_id FROM lists WHERE board_id = $1)",
        [ boardId ]
    )).rows;
    for (let card of cards) {
        let options = [ card.card_id ];
        await _card_delete( pool, { options: options } );
    }
    // Delete the board's file directory (Background image)
    try {
        let directory = `./public/files/boards/${boardId}/`;
        await deleteFolder( directory );
    } catch (err) {
        if (err.code !== "ENOENT") console.error( err );
    }
    // Delete board (Will delete lists automatically)
    await pool.query(
        "DELETE FROM boards WHERE board_id = $1",
        [ boardId ]
    );
}

// List Functions
// ==============
async function _list_create ( pool, data ) {
    // Previous ID ; List Title
    let previousId = data.options[0],
        title = data.options[1],
        boardId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a board
        boardId = previousId.substring(1);
        previousId = null;
    } else { // Is a list
        const previousNode = (await pool.query(
            "SELECT * FROM lists WHERE list_id = $1",
            [ previousId ]
        )).rows[0];
        boardId = previousNode.board_id;
    }

    // Add the new list
    let { rows } = await pool.query( `
        INSERT INTO lists (list_id, title, board_id, archived, previous_id)
        VALUES (DEFAULT, $1, $2, false, $3)
        RETURNING list_id`,
        [ title, boardId, previousId ]
    );

    let dbResponse = { id: rows[0].list_id };
    return dbResponse;
}
async function _list_title ( pool, data ) {
    const query = {
        text: "UPDATE lists SET title = $1 WHERE list_id = $2",
        values: [ data.options[1], data.options[0] ]
    };
    await pool.query( query );
}
async function _list_move ( pool, data ) {
    // List ID ; Previous ID
    let listId = data.options[0],	  // List to move
        previousId = data.options[1], // Target
        boardId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a board
        boardId = previousId.substring(1);
        previousId = null;
    } else { // Is a list
        const previousNode = (await pool.query(
            "SELECT * FROM lists WHERE list_id = $1",
            [ previousId ]
        )).rows[0];
        boardId = previousNode.board_id;
    }

    // Update old next node
    await pool.query( `
        UPDATE lists
        SET previous_id =
                (SELECT previous_id FROM lists WHERE list_id = $1)
        WHERE previous_id = $1`,
        [ listId ]
    );
    // Update new next node
    if (previousId === null)
        await pool.query( `
            UPDATE lists
            SET previous_id = $1
            WHERE previous_id IS NULL AND board_id = $2`,
            [ listId, boardId ]
        );
    else
        await pool.query( `
            UPDATE lists
            SET previous_id = $1
            WHERE previous_id = $2`,
            [ listId, previousId ]
        );
    // Update moved node
    await pool.query( `
        UPDATE lists
        SET previous_id = $1, board_id = $2
        WHERE list_id = $3`,
        [ previousId, boardId, listId ]
    );
}
async function _list_archive ( pool, data ) {
    let listId = data.options[0];
    const query = {
        text: "UPDATE lists SET archived = true WHERE list_id = $1",
        values: [ listId ]
    };
    await pool.query( query );
}
async function _list_restore ( pool, data ) {
    let listId = data.options[0];
    const query = {
        text: "UPDATE lists SET archived = false WHERE list_id = $1",
        values: [ listId ]
    };
    await pool.query( query );
}

// Card Functions
// ==============
async function _card_create ( pool, data ) {
    // Previous ID ; Card Title
    let previousId = data.options[0],
        title = data.options[1],
        listId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a list
        listId = previousId.substring(1);
        previousId = null;
    } else { // Is a card
        const previousNode = (await pool.query(
            "SELECT * FROM cards WHERE card_id = $1",
            [ previousId ]
        )).rows[0];
        listId = previousNode.list_id;
    }

    // Add the new card
    let { rows } = await pool.query( `
        INSERT INTO cards (card_id, title, list_id, archived, cover_id, description, previous_id, create_time, archive_time)
        VALUES (DEFAULT, $1, $2, false, NULL, NULL, $3, DEFAULT, NULL)
        RETURNING card_id, create_time`,
        [ title, listId, previousId ]
    );

    let dbResponse = { id: rows[0].card_id, create_time: rows[0].create_time };
    return dbResponse;
}
async function _card_title_edit ( pool, data ) {
    let id = data.options[0],
        title = data.options[1];
    const query = {
        text: "UPDATE cards SET title = $1 WHERE card_id = $2",
        values: [ title, id ]
    };
    await pool.query( query );
}
async function _card_description_edit ( pool, data ) {
    let id = data.options[0],
        description = data.options[1];
    const query = {
        text: "UPDATE cards SET description = $1 WHERE card_id = $2",
        values: [ description, id ]
    };
    await pool.query( query );
}
async function _card_move ( pool, data ) {
    // Card ID ; Previous ID
    let cardId = data.options[0],
        previousId = data.options[1],
        listId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a list
        listId = previousId.substring(1);
        previousId = null;
    } else { // Is a card
        const previousNode = (await pool.query(
            "SELECT * FROM cards WHERE card_id = $1",
            [ previousId ]
        )).rows[0];
        listId = previousNode.list_id;
    }

    // Update old next node
    await pool.query( `
        UPDATE cards
        SET previous_id =
            (SELECT previous_id FROM cards WHERE card_id = $1)
        WHERE previous_id = $1`,
        [ cardId ]
    );
    // Update new next node
    if (previousId === null)
        await pool.query( `
            UPDATE cards
            SET previous_id = $1
            WHERE previous_id IS NULL AND list_id = $2`,
            [ cardId, listId ]
        );
    else
        await pool.query( `
            UPDATE cards
            SET previous_id = $1
            WHERE previous_id = $2`,
            [ cardId, previousId ]
        );
    // Update moved node
    await pool.query( `
        UPDATE cards
        SET previous_id = $1, list_id = $2
        WHERE card_id = $3`,
        [ previousId, listId, cardId ]
    );
}
async function _card_archive ( pool, data ) {
    let cardId = data.options[0];
    const query = {
        text: "UPDATE cards SET archived = true, archive_time = now() WHERE card_id = $1",
        values: [ cardId ]
    };
    await pool.query( query );
}
async function _card_restore ( pool, data ) {
    let cardId = data.options[0];
    const query = {
        text: "UPDATE cards SET archived = false, archive_time = NULL WHERE card_id = $1",
        values: [ cardId ]
    };
    await pool.query( query );
}
async function _card_delete ( pool, data ) {
    let cardId = data.options[0];
    // Remove file folder
    try {
        let directory = `./public/files/cards/${cardId}/`;
        await deleteFolder( directory );
    } catch (err) {
        if (err.code !== "ENOENT") console.error( err );
    }
    // Change links
    await pool.query( `
        UPDATE cards 
        SET previous_id =
            (SELECT previous_id FROM cards WHERE card_id = $1)
        WHERE
            previous_id = $1`,
        [ cardId ]
    );

    // Delete card (Content deletes on cascade)
    await pool.query(
        "DELETE FROM cards WHERE card_id = $1",
        [ cardId ]
    );
}

// Card Cover Functions
// ====================
async function _card_cover_set ( pool, data ) {
    let cardId = data.options[0],
        attachmentId = data.options[1];
    const query = {
        text: "UPDATE cards SET cover_id = $1 WHERE card_id = $2",
        values: [ attachmentId, cardId ]
    };
    await pool.query( query );
}
async function _card_cover_remove ( pool, data ) {
    let cardId = data.options[0];
    const query = {
        text: "UPDATE cards SET cover_id = NULL WHERE card_id = $1",
        values: [ cardId ]
    };
    await pool.query( query );
}

// Attachment Functions
// ====================
async function _card_attachment_add ( pool, data ) {
    let cardId = data.options[0];
    const query = {
        text: "INSERT INTO attachments (attachment_id, url, name, card_id, color, creation_time, type, size) VALUES (DEFAULT, '#', '#', $1, '#', DEFAULT, DEFAULT, DEFAULT) RETURNING attachment_id, creation_time",
        values: [ cardId ]
    }, { rows } = await pool.query( query );

    let dbResponse = { id: rows[0].attachment_id, timestamp: rows[0].creation_time };
    return dbResponse;
}
async function _card_attachment_setup ( pool, data ) {
    let id = data.options[0],
        url = data.options[1],
        name = data.options[2] !== "" ? data.options[2] : null,
        color = data.options[3] !== "" ? data.options[3] : null,
        type = data.options[4],
        size = data.options[5];
    const query = {
        text: "UPDATE attachments SET url = $1, name = $2, color = $3, type = $4, size = $5 WHERE attachment_id = $6",
        values: [ url, name, color, type, size, id ]
    };
    await pool.query( query );
}
async function _card_attachment_edit ( pool, data ) {
    let id = data.options[0],
        name = data.options[1];
    const query = {
        text: "UPDATE attachments SET name = $1 WHERE attachment_id = $2",
        values: [ name, id ]
    };
    await pool.query( query );
}
async function _card_attachment_delete ( pool, data ) {
    let attachmentId = data.options[0];

    // Remove attachment from database
    let query = {
        text: "DELETE FROM attachments WHERE attachment_id = $1 RETURNING url, card_id, type",
        values: [ attachmentId ]
    },  { rows } = await pool.query( query ),
        attachmentUrl = rows[0].url,
        attachmentCard = rows[0].card_id,
        attachmentType = rows[0].type;

    // Delete attachment's file if any
    if (attachmentType !== "link") {
        try {
            let filePath = `./public${attachmentUrl}`,
                attachmentCount = await get( "card-count-file-attachments", attachmentCard );
            attachmentCount = attachmentCount.count;
            if (attachmentCount > 0) {
                filePath = filePath.match( /.*[/]/ )[0];
            } else {
                filePath = filePath.match( /.*\/cards\/[^/]*/ )[0];
            }
            await deleteFolder( filePath );
        } catch (err) {
            if (err.code !== "ENOENT") console.error( err );
        }
    }
}

// Checklist Functions
// ===================
async function _checklist_create ( pool, data ) {
    // Previous ID ; Title
    let previousId = data.options[0],
        title = data.options[1],
        cardId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a card
        cardId = previousId.substring(1);
        previousId = null;
    } else { // Is a checklist
        const previousNode = (await pool.query(
            "SELECT * FROM checklists WHERE checklist_id = $1",
            [ previousId ]
        )).rows[0];
        cardId = previousNode.card_id;
    }

    // Add the new checklist
    let { rows } = await pool.query( `
        INSERT INTO checklists (checklist_id, title, card_id, previous_id)
        VALUES (DEFAULT, $1, $2, $3)
        RETURNING checklist_id`,
        [ title, cardId, previousId ]
    );

    let dbResponse = { id: rows[0].checklist_id };
    return dbResponse;
}
async function _checklist_retitle ( pool, data ) {
    let id = data.options[0],
        title = data.options[1];
    const query = {
        text: "UPDATE checklists SET title = $1 WHERE checklist_id = $2",
        values: [ title, id ]
    };
    await pool.query( query );
}
async function _checklist_move ( pool, data ) {
    // Checklist ID ; Previous ID
    let checklistId = data.options[0],
        previousId = data.options[1],
        cardId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a card
        cardId = previousId.substring(1);
        previousId = null;
    } else { // Is a checklist
        const previousNode = (await pool.query(
            "SELECT * FROM checklists WHERE checklist_id = $1",
            [ previousId ]
        )).rows[0];
        cardId = previousNode.card_id;
    }

    // Update old next node
    await pool.query( `
        UPDATE checklists
        SET previous_id =
            (SELECT previous_id FROM checklists WHERE checklist_id = $1)
        WHERE previous_id = $1`,
        [ checklistId ]
    );
    // Update new next node
    if (previousId === null)
        await pool.query( `
            UPDATE checklists
            SET previous_id = $1
            WHERE previous_id IS NULL AND card_id = $2`,
            [ checklistId, cardId ]
        );
    else
        await pool.query( `
            UPDATE checklists
            SET previous_id = $1
            WHERE previous_id = $2`,
            [ checklistId, previousId ]
        );
    // Update moved node
    await pool.query( `
        UPDATE checklists
        SET previous_id = $1
        WHERE checklist_id = $2`,
        [ previousId, checklistId ]
    );
}
async function _checklist_delete ( pool, data ) {
    let checklistId = data.options[0];
    // Change links
    await pool.query( `
        UPDATE checklists
        SET previous_id =
            (SELECT previous_id FROM checklists WHERE checklist_id = $1)
        WHERE previous_id = $1`,
        [ checklistId ]
    );
    
    // Delete checklist
    await pool.query(
        "DELETE FROM checklists WHERE checklist_id = $1",
        [ checklistId ]
    );
}

// Checklist Item Functions
// ========================
async function _item_create ( pool, data ) {
    // Previous ID ; Content
    let previousId = data.options[0],
        content = data.options[1],
        checklistId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a checklist
        checklistId = previousId.substring(1);
        previousId = null;
    } else { // Is an item
        const previousNode = (await pool.query(
            "SELECT * FROM checklist_items WHERE item_id = $1",
            [ previousId ]
        )).rows[0];
        checklistId = previousNode.checklist_id;
    }

    // Add the new item
    let { rows } = await pool.query( `
        INSERT INTO checklist_items (item_id, item_content, checklist_id, checked, previous_id)
        VALUES (DEFAULT, $1, $2, false, $3)
        RETURNING item_id`,
        [ content, checklistId, previousId ]
    );

    let dbResponse = { id: rows[0].item_id };
    return dbResponse;
}
async function _item_check ( pool, data ) {
    let itemId = data.options[0],
        checked = data.options[1];

    const query = {
        text: "UPDATE checklist_items SET checked = $1 WHERE item_id = $2",
        values: [ checked, itemId ]
    }, idx = await pool.query( query );
}
async function _item_edit ( pool, data ) {
    let itemId = data.options[0],
        content = data.options[1];

    const query = {
        text: "UPDATE checklist_items SET item_content = $1 WHERE item_id = $2",
        values: [ content, itemId ]
    }, idx = await pool.query( query );
}
async function _item_move ( pool, data ) {
    // Item ID ; Previous ID
    let itemId = data.options[0],
        previousId = data.options[1],
        checklistId;

    // Identify previous node
    if (previousId.substring(0, 1) === "_") { // Is a checklist
        checklistId = previousId.substring(1);
        previousId = null;
    } else { // Is an item
        const previousNode = (await pool.query(
            "SELECT * FROM checklist_items WHERE item_id = $1",
            [ previousId ]
        )).rows[0];
        checklistId = previousNode.checklist_id;
    }

    // Update old next node
    await pool.query( `
        UPDATE checklist_items
        SET previous_id =
            (SELECT previous_id FROM checklist_items WHERE item_id = $1)
        WHERE previous_id = $1`,
        [ itemId ]
    );
    // Update new next node
    if (previousId === null)
        await pool.query( `
            UPDATE checklist_items
            SET previous_id = $1
            WHERE previous_id IS NULL AND checklist_id = $2`,
            [ itemId, checklistId ]
        );
    else
        await pool.query( `
            UPDATE checklist_items
            SET previous_id = $1
            WHERE previous_id = $2`,
            [ itemId, previousId ]
        );
    // Update moved node
    await pool.query( `
        UPDATE checklist_items
        SET previous_id = $1, checklist_id = $2
        WHERE item_id = $3`,
        [ previousId, checklistId, itemId ]
    );
}
async function _item_delete ( pool, data ) {
    // Item ID
    let itemId = data.options[0];

    // Change links
    await pool.query( `
        UPDATE checklist_items
        SET previous_id =
            (SELECT previous_id FROM checklist_items WHERE item_id = $1)
        WHERE
            previous_id = $1`,
        [ itemId ]
    );

    // Delete the checklist
    await pool.query(
        "DELETE FROM checklist_items WHERE item_id = $1",
        [ itemId ]
    );
}

// File Manipulation
// =================
function deleteFolder ( path ) {
    if ( path.substr(0, 1) === "/" ) return;
    return new Promise ( async (resolve, reject) => {
        try {
            let entries = await fs.readdir( path );
            for (let entry of entries) {
                let curPath = path + "/" + entry,
                    pathStat = await fs.lstat(curPath);
                if ( pathStat.isDirectory() ) { // If a directory
                    await deleteFolder( curPath );
                } else {    // If a file
                    await fs.unlink( curPath );
                }
            }
            await fs.rmdir( path );
            resolve();
        } catch (err) {
            if (err.code !== "ENOENT") reject( err );
            else resolve();
        }
    });
}

// Export the functions
exports.getAll = getAll;
exports.get = get;
exports.getData = getData;
exports.setData = setData;
