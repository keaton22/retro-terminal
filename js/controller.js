var page;                           // the page json
var numRequiredTemplates;           // each page (json) has templates
var numTemplatesPopulated = 0;      // keep a count of those templates so we know when the page is complete
var contentHeight = 312;            // the height of the interface
var headerHeight = 54;              // the height of the header
var footerHeight = 40;              // the height of the footer (this value is altered slightly)
var availableHeight;                // equal to contentHeight - (headerHeight + welcomeTemplateHeight + footerHeight)
var menuItemHeight = 24;            // the height of each menu item
var noteLineHeight = 12;            // the height of each note line



// PREPARE THE TEMPLATES

function prepareTheTemplates(response) {
    page = JSON.parse(response.responseText);                       // get the page data [JSON]

    if (page.source.location === '') {                                          // if the page has no source location
        console.error('the "' + page.name + '" page has no source location')        // throw an error
    }

    numRequiredTemplates = Object.keys(page.templates).length;      // find all property names within an object, make an array of them, then count them

    console.groupCollapsed('got data from ' + page.name + '.json');

    if (page.templates.welcome) {                                   // if the page has a welcome template
        console.groupCollapsed('page has a welcome template');
        document.body.classList.add('template-welcome');                // add 'template-welcome' class to the <body>
        prepareWelcome();                                               // prepare the welcome template
    }

    if (page.templates.menu) {                                      // if the page has a menu template
        console.groupCollapsed('page has a menu template');
        document.body.classList.add('template-menu');                   // add 'template-menu' class to the <body>
        writeMenu();                                                    // prepare the menu template
    }

    if (page.templates.note) {                                      // if the page has a note template
        console.groupCollapsed('page has a note template');
        document.body.classList.add('template-note');                   // add 'template-note' class to the <body>
        writeNote();                                                    // prepare the note template
    }
}



// PREPARE WELCOME TEMPLATE

function prepareWelcome() {
    var welcome = page.templates.welcome;
    var charsPerLine = 38;                                                          // how many characters can fit on one line
    var lineHeight = 12;                                                            // how tall is one line
    var chinHeight = 7;                                                             // how tall is the bottom padding plus the bottom border

    welcome.formattedText = wordWrap(welcome.text, charsPerLine)                    // format the welcome text as an array of lines welcome text
    welcome.height = (welcome.formattedText.length * lineHeight) + chinHeight;      // calculate the height of the template

    document.querySelector('.welcome').style.height = welcome.height + 'px';        // set the height of the template

    page.templates.welcome = welcome;                                               // save the new welcome properties to the 'page' variable

    console.info('prepared the welcome template');

    console.groupEnd();

    templatePopulated();                                                            // check and see if this is the last template
}



// WRITE WELCOME TEMPLATE

function writeWelcome() {
    var welcome = page.templates.welcome;                                   // the welcome template
    var formattedText = welcome.formattedText;                              // an array of each line of text in the welcome template
    var welcomeElem = document.querySelector('.welcome');                   // the element receiving the welcome text
    var i = 0;                                                              // the iterator for the recursive loop below

    welcomeElem.innerHTML = '';                                             // clear out the existing welcome text
    document.querySelector('.welcome').style.borderColor = 'transparent';   // make the bottom border transparent

    function writeLine(array, elem, i) {                                    // a recursive function to write each line of the welcome text
        if (i < array.length) {                                                 // iterate over each text line
            typewriterEffect(array[i], elem, page.name, function () {               // write the text, then at the end of each line...
                elem.innerHTML += '<br/>';                                              // append a line break
                i++;                                                                    // increment the iterator
                writeLine(array, elem, i);                                              // repeat the recursive function
            });
        } else {                                                                // after all lines have been written...
            document.querySelector('.welcome').style.borderColor = 'currentColor';  // apply the currentColor to the welcome template's bottom border
        }
    }

    writeLine(formattedText, welcomeElem, i);                               // start the recursive function

    console.info('finished writing the welcome template');
}



// WRITE MENU TEMPLATE

function writeMenu() {
    var menu = page.templates.menu;
    var items = menu.items;

    menu.height = document.querySelector('.menu').offsetHeight;                     // the height of full menu (inclusive of the heights of all items)
    availableHeight = calculateAvailableHeight();                                   // the available space for the menu to show in
    document.querySelector('.menu').style.height = availableHeight + 'px';          // set the menu height to the availableHeight

    if (page.source.location !== 'root') {                  // if the page's source location isn't 'root' (e.g. the page is not 'home')
        items.push({                                            // insert 'Back' at the end of the menu
            'name': 'back',                                         // set its name
            'label': 'Back',                                        // set its label
            'location': page.source.location,                       // set its location
            'result': page.source.result                            // set its result text
        });
    }

    var numMenuSections = 0;                                                        // how many menu sections are there?
    var numItemsPerMenuSection = Math.floor(availableHeight / menuItemHeight);      // how many menu items can fit in the available space?

    for (i = 0; i < items.length; i++) {                    // the for loop that determines where to put 'Next' and 'Previous' menu items

        if ((((i + 1) % numItemsPerMenuSection) === 0) && (items.length > numItemsPerMenuSection)) {    // if a new section is needed

            items.splice(i, 0, {                            // insert 'Next' item at the current index
                'name': 'next',                                 // set its name
                'label': 'Next',                                // set its label
                'action': 'moveCursor',                         // set its action to moveCursor
                'value': '0',                                   // set its value to 0 (e.g. moveCursor(0))
            });

            items.splice((i + 1), 0, {                      // insert 'Previous' item at the index after the current index
                'name': 'previous',                             // set its name
                'label': 'Previous',                            // set its label
                'action': 'moveCursor',                         // set its action to moveCursor
                'value': '1',                                   // set its value to 0 (e.g. moveCursor(1))
            });

            i += 2;                                         // add 2 to the count to make up for the two menu items just added
        }
    }

    for (i = 0; i < items.length; i++) {                    // the for loop that builds the menu items

        var li = document.createElement('li');
        var text = document.createTextNode(items[i].label);
        li.classList.add('item');

        li.setAttribute('data-name', (items[i].name || ''));                    // set name (required)
        li.setAttribute('data-label', (items[i].label || ''));                  // set label (required)
        li.setAttribute('data-menu-section', (numMenuSections + 1));            // set menu section (first section is 1, not 0)
        li.setAttribute('tabindex', '-1');                                      // set tabindex (allows element to be focusable)

        if (numMenuSections === 0) {                                            // if this is the only menu section
            li.classList.add('visible');                                            // make its items visible
        }

        // only allow the following attributes to be created if they exist in the json
        items[i].location && li.setAttribute('data-location', items[i].location);       // set location (like [href])
        items[i].action && li.setAttribute('data-action', items[i].action);             // set action (like [onclick])
        items[i].value && li.setAttribute('data-value', items[i].value);                // set value (if choosing between things)
        items[i].result && li.setAttribute('data-result', items[i].result);             // set result (the feedback message)

        items[i].location && li.addEventListener('keydown', function (e) {              // keydown event listener for location
            if (e.which === 13 || e.which === 32) {                                         // if enter key is pressed

                setResult(this.getAttribute('data-result'));                                    // set the result text

                var itemLocation = this.getAttribute('data-location');                          // track the item location

                loadPage(itemLocation);                                                         // load the page and create a new history state
            }
        });

        items[i].action && li.addEventListener('keydown', function (e) {                // keydown event listener for action
            if (e.which === 13 || e.which === 32) {                                         // if enter key or spacebar is pressed

                setResult(this.getAttribute('data-result'));                                    // set the result text

                doAction(this);                                                                 // do the thing the menu item says it does
            }
        });

        li.appendChild(text);                                                           // put text in <li> elements
        document.querySelector('.menu').appendChild(li);                                // put <li> elements in .menu
        console.info('injected "' + items[i].label + '" into menu');

        if ((i + 1) % numItemsPerMenuSection === 0) {                                   // if it's the last menu item in the section
            numMenuSections++;                                                              // increment numMenuSections
        }
    }

    document.querySelector('.menu').setAttribute('data-menu-current-section', 1);                   // set the first menu section to the current menu section
    document.querySelector('.menu').setAttribute('data-menu-total-sections', numMenuSections + 1);  // set total number of menu sections
    document.querySelector('.menu .item').classList.add('selected');                                // add .selected to the first menu item
    document.querySelector('.menu .item').focus();                                                  // put :focus on the first menu item

    console.groupEnd();

    templatePopulated();
}



// WRITE NOTE TEMPLATE

function writeNote() {
    var note = page.templates.note;

    note.height = document.querySelector('.note').offsetHeight;                     // the height of full note (inclusive of heights of all sections)
    availableHeight = calculateAvailableHeight();                                   // the available space for the note to show in
    document.querySelector('.note').style.height = availableHeight + 'px';          // set the note height to the availableHeight

    var noteLines = wordWrap(note.text, 44, false, false);                         // create an array of each line of the note using wordWrap()
    var noteSections = [];                                                          // create an array for each section of the note
    var numNoteSections = 0;                                                        // count how many sections the note has
    var numLinesPerNoteSection = Math.floor(availableHeight / noteLineHeight);      // how many text lines can fit in the remaining space?

    for (i = 0; i < noteLines.length; i++) {                                        // iterate through each line of the note

        if (noteSections[numNoteSections] === undefined) {                          // if the current section doesn't have anything in it yet
            noteSections[numNoteSections] = '';                                         // prevent it from prefixing that section with 'undefined'
        }

        noteSections[numNoteSections] += noteLines[i];                                  // keep on appendin'

        if (((i + 1) % numLinesPerNoteSection === 0) || ((i + 1) === noteLines.length)) {   // if it's the section's last line OR if it's the very last line
            var span = document.createElement('span');                                          // make a <span> element
            var text = document.createTextNode(noteSections[numNoteSections]);                  // make a text node containing the text from the current section

            span.setAttribute('data-note-section', numNoteSections + 1);                        // number this note section ('+ 1' so we start the count at 1)
            span.appendChild(text);                                                             // put text node in <span> element
            document.querySelector('.note').appendChild(span);

            numNoteSections++;                                                                  // increment the number of note sections (final value will be
        }                                                                                       // 1 greater than it should, keep this in mind when labeling
    }                                                                                           // data-note-total-sections below because it won't need '+ 1')

    document.querySelector('.note [data-note-section="1"]').classList.add('active');            // set the 'active' class on the first section
    document.querySelector('.note').setAttribute('data-note-total-sections', numNoteSections);  // set total number of note sections (no '+ 1', see above)
    document.querySelector('.note').setAttribute('data-source-location', page.source.location); // set source location
    document.querySelector('.note').setAttribute('data-source-result', page.source.result);     // set source result text

    console.info('injected data into note');

    console.groupEnd();

    templatePopulated();
}



// TEMPLATE POPULATED (TEMPLATE QUEUE)

function templatePopulated() {
    numTemplatesPopulated++;                                // increment the number of templates populated in the page

    if (numTemplatesPopulated === numRequiredTemplates) {    // once all page templates are populated
        numTemplatesPopulated = 0;                              // reset the count for populated page templates

        pageLoaded();                                           // initialize the page

        console.groupCollapsed('injecting data into page templates...');

        if (page.templates.welcome) {                           // if the page has a welcome template
            writeWelcome();                                         // write it
        }

        if (page.templates.menu) {                              // if the page has a menu template

        }

        if (page.templates.note) {                              // if the page has a note template

        }

        console.groupEnd();
        console.info('page loaded successfully!');
        console.groupEnd();
    }
}



// PAGE LOADED (AFTER ALL TEMPLATES ARE POPULATED)

function pageLoaded() {
    var color = getColor();                                     // get the color
    var difficulty = getDifficulty();                           // get the difficulty

    setColor(color.name, color.value);                          // set the color's name and value
    setDifficulty(difficulty.name, difficulty.value);           // set the difficulty's name and value
    drawFavicon();
}



// AJAX HELPER FUNCTION

function ajax(file, method, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr);
        }
    }
    xhr.open(method, file, true);
    xhr.send();
}



// CALCULATE AVAILABLE HEIGHT HELPER

function calculateAvailableHeight() {
    return (contentHeight - (headerHeight + page.templates.welcome.height + footerHeight));     // calculate the available space for the menu to show in
}



// WORD WRAP HELPER FUNCTION

function wordWrap(string, charsPerLine, lineBreakCharacter, breakWord) {        // see https://j11y.io/snippets/wordwrap-for-javascript/
    var lineBreakCharacter = lineBreakCharacter || null;                            // what to insert at the end of a line (by default, insert nothing)
    var breakWord = breakWord || false;                                             // whether or not to break long words (by default, don't)

    if (!string) {                                                                  // if the string is empty
        return string;                                                                  // return an empty string
    }

    var regex = '\\n|.{1,' + charsPerLine + '}(\\s|$)' + (breakWord ? '|.{' + charsPerLine + '}|.+$' : '|\\S+?(\\s|$)');      // *mind blown*

    if (!lineBreakCharacter) {                                                      // if we don't want to use a line break character
        return string.match(RegExp(regex, 'g'));                                        // return an array comprised of each line
    } else {                                                                        // if we do want to use a line break character
        return string.match(RegExp(regex, 'g')).join(lineBreakCharacter);               // return a string with line break characters
    }
}



// TYPEWRITER EFFECT

function typewriterEffect(string, elem, currentPage, callback, delay) {
    callback = callback || undefined;
    delay = delay || 10;
    var i = 0;

    function writeCharacter(string, elem, callback, delay, i) {
        if (currentPage === page.name) {
            if (i < string.length) {
                elem.innerHTML += string.charAt(i);
                i++;
                setTimeout(function () {
                    writeCharacter(string, elem, callback, delay, i);
                }, delay);
            } else {
                if (typeof(callback) !== 'undefined') {
                    callback();
                }
            }
        }
    }

    writeCharacter(string, elem, callback, delay, i);
}
