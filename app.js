"use strict";

// General variables
const imageTypes = [ "image/apng", "image/bmp", "image/gif", "image/jpeg", "image/png", "image/webp" ],
    audioTypes = [ "audio/wave", "audio/wav", "audio/x-wav", "audio/x-pn-wav", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", ];

// Functions
function getDominantColor (image) {
    return new Promise( (resolve, reject) => {
        try {
            gm( image )
                .resize( 250, 250 )
                .colors( 1 )
                .toBuffer( "RGB", (error, buffer) => {
                    if (error) throw error;
                    let rgb = buffer.slice(0, 3),
                        r = (rgb[0].toString(16)).padStart(2, "0"),
                        g = (rgb[1].toString(16)).padStart(2, "0"),
                        b = (rgb[2].toString(16)).padStart(2, "0");
                    resolve( `#${r}${g}${b}` );
                });
        } catch (err) {
            reject( err );
        }
    });
}

// Setting up NodeJS and ExpressJS
const express = require( "express" ),
    formidable = require( "formidable" ),
    fs = require( "fs" ).promises,
    path = require( "path" ),
    gm = require( "gm" ).subClass({ imageMagick: true }),
    db = require( "./scripts/db.js" ),
    app = express(),
    port = 7001,
    server = require( "http" ).createServer( app );

app.use( express.json() );

// Home page
app.get( "/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Board / Card details
app.get( /\/[bc]\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.*/, (req, res) => {
    //let segments = req.url.split(path.sep).filter(segment => segment !== "");
    res.sendFile(__dirname + "/public/index.html");
    //res.json({ secret: "Ping pong" });
    //res.end( "Ping pong" );
});

app.get( "/boards_data", async (req, res) => {
    res.json( await db.getAll() );
});

app.post( "/edit_data", async (req, res) => {
    console.log( "app.post - req.body (Client's request):" );
    console.log( req.body );
    let dbRes = await db.setData( req.body );
    console.log( "app.post - dbRes (Database's response):" );
    console.log( dbRes );
    res.json ( dbRes );
});
app.post( "/get_data", async (req, res) => {
    console.log( "app.get - req.body (Client's request):" );
    console.log( req.body );
    let dbRes = await db.getData( req.body );
    console.log( "app.get - dbRes (Database's response):" );
    console.log( dbRes );
    res.json ( dbRes );
});

app.post( "/upload_background", async (req, res) => {
    try {
        // Delete old files if any
        let files = await fs.readdir( "./public/files/tmp/new_board_bg/" );
        for (let file of files) {
            await fs.unlink( "./public/files/tmp/new_board_bg/" + file );
            console.log( "Deleted: ", file );
        }
    } catch (err) {
        if (err.code !== "ENOENT") console.error( err );
    }

    try {
        // Receive and save the new image in a temporary folder
        let form = new formidable.IncomingForm();
        form.uploadDir = "./server_resources/cache";
        form.parse( req, async (err, fields, files) => {
            if (err) throw err;

            let bgPath = "./public/files/tmp/new_board_bg/",
                oldPath = files.background.path,
                newPath = bgPath + files.background.name;

            try {
                // Make a new directory for the board
                await fs.mkdir( bgPath, { recursive: true } );
                // Move the file
                await fs.rename( oldPath, newPath );

                console.log( "File successfuly received and moved!" );
                res.end( `{"url": "/files/tmp/new_board_bg/${files.background.name}"}` );
            } catch (err) {
                if (err.code !== "ENOENT") console.error( err );
            }
        });
    } catch (err) {
        if (err.code !== "ENOENT") console.error( err );
    }
});

app.post( "/update_background", async (req, res) => {
        // Receive and save the new image
        let form = new formidable.IncomingForm();
        form.uploadDir = "./server_resources/cache";
        form.parse( req, async (err, fields, files) => {
            if (err) throw err;

            let boardId = fields.board,
                absoluteBgPath = `/files/boards/${boardId}/`,
                bgPath = `./public${absoluteBgPath}`,
                oldPath = files.background.path,
                newPath = `${bgPath}${files.background.name}`;

            try {
                // Delete old files if any
                let fileEntries = await fs.readdir( `${bgPath}` );
                for (let file of fileEntries) {
                    await fs.unlink( `${bgPath}${file}` );
                    console.log( "Deleted: ", file );
                }
            } catch (err) {
                if (err.code !== "ENOENT") console.error( err );
            }

            try {
                // Make a new directory for the board if it doesn't already have one
                await fs.mkdir( bgPath, { recursive: true } );

                // Move the image file
                await fs.rename( oldPath, newPath );
                console.log( "File successfuly received and moved!" );

                // Record change in database
                await db.setData( { action: "board-background-image", options: [ boardId, `${absoluteBgPath}${files.background.name}` ] } );

                res.end( `{"url": "${absoluteBgPath}${files.background.name}"}` );
            } catch (err) {
                console.error( err );
            }
        });
});

app.post( "/upload_attachment", async (req, res) => {
    let form = new formidable.IncomingForm(),
        attachmentData = {
            id: "",
            timestamp: "",
            card: "",
            url: "",
            name: "",
            color: "#",
            type: "",
            size: null
        };
    form.uploadDir = "./server_resources/cache";
    form.parse( req, async (err, fields, files) => {
        attachmentData.card = fields.card_id;

        // =*=*=*=*=*= Check attachment's type =*=*=*=*=*= //
        if (typeof files.attachment !== "undefined") { // If the attachment is a file
            attachmentData.name = files.attachment.name;
            // Check the file type
            if ( imageTypes.includes(files.attachment.type) ) {
                attachmentData.type = "image";
            } else if ( audioTypes.includes(files.attachment.type) ) {
                attachmentData.type = "audio";
            } else {
                console.error( "Error: Unsupported file type" );
                res.end( '{"error": "Unsupported file type"}' );
                return;
            }
        } else {    // Otherwise, it's a link (No file)
            attachmentData.type = "link";
            attachmentData.url = (() => {
                let url = fields.attachment,
                    protocol = url.match( /^http[s]?:\/\// );

                if (protocol === null)
                    url = `http://${url}`;

                return url;
            })();
            if (fields.name === null || typeof fields.name === "undefined" || fields.name === "null")
                attachmentData.name = attachmentData.url;
            else
                attachmentData.name = fields.name;
        }

        // =*=*=*=*=*= Add attachment to the database =*=*=*=*=*= //
        let tmpData = {
            action: "card-attachment-add",
            options: [ attachmentData.card ]
        }, tmpRes = await db.setData( tmpData );
        attachmentData.id = tmpRes.id;
        attachmentData.timestamp = tmpRes.timestamp;

        // =*=*=*=*=*= Handle the file =*=*=*=*=*= //
        if (attachmentData.type !== "link") { // Move the file if any
            //let boardIdRes = await db.get( "board-of-card", attachmentData.card ),
                //boardId = boardIdRes.id,
                //filePath = `/files/boards/${boardId}/cards/${attachmentData.card}/attachments/${attachmentData.id}`,
            let filePath = `/files/cards/${attachmentData.card}/attachments/${attachmentData.id}`,
                fileUrl = `${filePath}/${files.attachment.name}`,
                oldPath = files.attachment.path,
                newPath = `./public${fileUrl}`;
            attachmentData.url = fileUrl;
            attachmentData.size = files.attachment.size
            try {   // Create the directory if it hasn't been done yet
                await fs.mkdir( `./public${filePath}`, {recursive: true} );
            } catch (err) {
                if (err.code !== "EEXIST") console.error( err );
            }
            try {   // Move the file
                await fs.rename( oldPath, newPath );
                console.log( "File successfuly received and moved!" );
            } catch (err) {
                console.error( err );
            }
        }

        // Get the accent color if an image
        if (attachmentData.type === "image") {
            attachmentData.color = await getDominantColor( `./public${attachmentData.url}` );
        }

        // =*=*=*=*=*= ------------------------------- =*=*=*=*=*= //
        // =*=*=*=*=*= Write changes into the database =*=*=*=*=*= //
        // =*=*=*=*=*= ------------------------------- =*=*=*=*=*= //
        let data = {
            action: "card-attachment-setup",
            options: [ attachmentData.id, attachmentData.url, attachmentData.name, attachmentData.color, attachmentData.type, attachmentData.size ]
        };
        await db.setData( data );
        console.log( attachmentData );

        res.end( JSON.stringify(attachmentData) );
    });
});

app.use( express.static(__dirname + "/public") );

server.listen( port );
