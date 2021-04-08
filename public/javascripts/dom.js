// Query an element with css selectors
function $ (query, parent = document) {
    return parent.querySelector( query );
}

// Create an element with emmet syntax
function _ (string) {
    const spChar= "#.",
        reStr = `([${spChar}][^${spChar}]+)`,
        re = new RegExp( reStr ),
        steps = string.split( re ).filter(item => item); // Removing the empty separator strings // .length != 0);

    let element = document.createElement( steps.shift() );

    steps.forEach( (step) => {
        switch ( step.charAt(0) ) {
            case "#":
                element.setAttribute( "id", step.substr(1) );
                break;
            case ".":
                element.classList.add( step.substr(1) );
                break;
            default:
                break;
        }
    });

    return element;
}
