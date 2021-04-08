"use strict";

// In this file are all functions responsible for interacting with the server

async function getFromServerAll () {
    let data = {};
    await fetch( "/boards_data" )
        .then( response => response.json() )
        .then( json => data = json );
    return data;
}

async function getFromServer (query, ...options) {
    let data = { query: query, options: options },
        res = {};

    try {
        let response = await fetch( "/get_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify( data )
        });
        res = response.json();
    } catch (error) {
        console.error( "Error: ", error );
    }

    return res;
}

async function sendToServer (action, ...options) {
    let data = { action: action, options: options },
        res = {};

    try {
        let response = await fetch( "/edit_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify( data )
        });
        res = response.json();
    } catch (error) {
        console.error( "Error: ", error );
    }

    return res;
}

async function uploadBackgroundImage(image) {
    let formData = new FormData(),
        imageUrl = "";
    formData.append( "background", image );

    await fetch( "/upload_background", {
        method: "POST",
        body: formData
    })
        .then( response => response.json() )
        .then( json => imageUrl = json.url )
        .catch( error => console.error(error) );

    return imageUrl;
}

async function updateBackgroundImage(boardId, image) {
    let formData = new FormData(),
        imageUrl = "";
    formData.append( "background", image );
    formData.append( "board", boardId );

    await fetch( "/update_background", {
        method: "POST",
        body: formData
    })
        .then( response => response.json() )
        .then( json => imageUrl = json.url )
        .catch( error => console.error(error) );

    return imageUrl;
}

async function uploadAttachment (cardId, obj) {
    let res = {},
        formData = new FormData();
    formData.append( "card_id", cardId );
    if (obj.type === "link") {
        formData.append( "attachment", obj.url );
        formData.append( "name", obj.name );
    } else {
        formData.append( "attachment", obj );
    }

    await fetch( "/upload_attachment", {
        method: "POST",
        body: formData
    })
        .then( response => response.json() )
        .then( json => res = json )
        .catch( error => {
            console.error(error);
            throw error;
        });

    return res;
}
