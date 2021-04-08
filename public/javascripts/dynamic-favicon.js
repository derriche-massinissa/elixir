function getDataUrl ( type, value = null ) {
    return new Promise ( (resolve, reject) => {
        // Create a canvas
        let canvas = _( "canvas" ),
            ctx = canvas.getContext( "2d" );
        canvas.width = 64; //512; //64;
        canvas.height = 64; //512; //64;
        // TODO: Comment out !!! ===============================================
        /*let oldCanvas = $("#tmpKanvaz");
        if (oldCanvas !== null) $("body").removeChild( oldCanvas );
        canvas.style.border = "solid red 2px";
        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style.transform = "translateX(-50%) translateY(-50%)";
        canvas.id = "tmpKanvaz";
        $("body").appendChild( canvas );*/
        // TODO: Comment out !!! ===============================================

        if (type === "image") {
            // Create an image element
            let bgImage = new Image();
            bgImage.crossOrigin = "anonymous";

            // Function to be executed once the image loads completely
            bgImage.onload = () => {
                let largeSize = "height",
                    smallSize = "width",
                    overflowAxis = "y",
                    d = {
                        x: 0,
                        y: 0,
                        width: 64,
                        height: 64
                    };

                if (bgImage.width >= bgImage.height) {
                    largeSize = "width";
                    smallSize = "height";
                    overflowAxis = "x";
                }
                let ratio = bgImage[smallSize] / bgImage[largeSize];
                d[smallSize] = canvas[smallSize];
                d[largeSize] = d[smallSize] / ratio;
                d[overflowAxis] = -((d[largeSize] - canvas[largeSize]) / 2);

                // Draw the bg image
                ctx.drawImage( bgImage, d.x, d.y, d.width, d.height );
                // Draw logo
                printLogoOnCanvas( canvas );
                
                // Resolve the promise
                resolve( canvas.toDataURL() );
            }

            // Start loading the image
            bgImage.src = value;
        } else if (type === "color" || type === "default") {
            // Fill with color
            if (type === "color")
                ctx.fillStyle = value;
            else if (type === "default") {
                let linearGradient = ctx.createLinearGradient( canvas.width*0.5, canvas.height*0.3, canvas.width*0.5, canvas.height*1.5 );
                linearGradient.addColorStop( 0, "#F20D71" );
                linearGradient.addColorStop( 1, "#8900fc" );
                ctx.fillStyle = linearGradient;
            }
            ctx.rect( 0, 0, canvas.width, canvas.height );
            ctx.fill();

            // Draw logo
            printLogoOnCanvas( canvas );
            
            // Resolve the promise
            resolve( canvas.toDataURL() );
        }
    });
}

function printLogoOnCanvas( canvas ) {
    let ctx = canvas.getContext( "2d" ),
        h = canvas.height,
        w = canvas.width;

    // Add logo
    let start = {}, cp1 = {}, cp2 = {}, end = {};
    // Surface
    ctx.beginPath();
    // Wave 1
    start = { x: 0, y: h*0.20 };
    cp1 = { x: w*0.21, y: h*0.29 };
    cp2 = { x: w*0.41, y: h*0.22 };
    end = { x: w/2, y: h*0.18 };
    ctx.moveTo( start.x, start.y );
    ctx.bezierCurveTo( cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y );
    // Wave 2
    cp1 = { x: w*0.6, y: h*0.14 };
    cp2 = { x: w*0.8, y: h*0.06 };
    end = { x: w*1.04, y: h*0.19 };
    ctx.bezierCurveTo( cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y );
    // Close the shape
    end = { x: w*1.04, y: h*(-0.1) };
    ctx.lineTo( end.x, end.y );
    end = { x: w*(-0.1), y: h*(-0.1) };
    ctx.lineTo( end.x, end.y );
    // Draw the top part
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Bubbles
    // Bubble 1
    ctx.beginPath();
    ctx.arc( w*0.75, h*0.25, w*0.15, 0, Math.PI*2, true );
    //ctx.arc( w*0.77, h*0.3, w*0.15, 0, Math.PI*2, true );
    // Draw the bubble
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    // Bubble 2
    ctx.beginPath();
    ctx.arc( w*0.25, h*0.5, w*0.11, 0, Math.PI*2, true );
    // Draw the bubble
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    // Bubble 3
    ctx.beginPath();
    ctx.arc( w*0.5, h*0.75, w*0.07, 0, Math.PI*2, true );
    // Draw the bubble
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Round corners
    let radius = canvas.width*0.16,
        x = 0, y = 0, width = canvas.width, height = canvas.height;
    drawRect( ctx, x, y, width, height, radius, true );
}
function OLDprintLogoOnCanvas( canvas ) {
    let ctx = canvas.getContext( "2d" );
    // Round corners
    let radius = 80,
        x = 0, y = 0, width = canvas.width, height = canvas.height;
    drawRect( ctx, x, y, width, height, radius, true );
    // Add logo
    radius = canvas.width / 10.2;
    x = canvas.width / 8;
    y = canvas.height / 8;
    width = canvas.width / 3.2;
    height = canvas.height - (canvas.height / 6) - y;
    drawRect( ctx, x, y, width, height, radius );
    x = canvas.width - width - x;
    height = canvas.height - (canvas.height / 2.5) - y;
    drawRect( ctx, x, y, width, height, radius );
}

function drawRect( ctx, x, y, width, height, radius, mask = false ) {
    ctx.beginPath();
    ctx.moveTo( x + radius, y );
    ctx.lineTo( x + width - radius, y );
    ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
    ctx.lineTo( x + width, y + height - radius );
    ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
    ctx.lineTo( x + radius, y + height );
    ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
    ctx.lineTo( x, y + radius );
    ctx.quadraticCurveTo( x, y, x + radius, y );
    ctx.closePath();
    ctx.fillStyle = "#fff";
    if (mask) ctx.globalCompositeOperation = "destination-in";
    ctx.fill();
    if (mask) ctx.globalCompositeOperation = "source-over";
}

async function setFavicon (type, value) {
    let src = await getDataUrl( type, value );

    let newFavicon = _("link");
    newFavicon.rel = "icon";
    newFavicon.type = "image/png";
    newFavicon.sizes = "64x64";
    newFavicon.id = "favicon";
    newFavicon.href = src;

    let oldFavicon = $("#favicon");
    if (oldFavicon !== null) document.head.removeChild( oldFavicon );
    document.head.appendChild( newFavicon );
}
