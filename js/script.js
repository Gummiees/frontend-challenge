/** 
 * In this code I do not try to make it work in IE. If so, I would have to use older JS and not ES6.
 * 
 * I tested the code for Chrome, Firefox, Edge and Opera (latest versions for each). Couldn't try on Safari since I don't have a Mac.
 */

/* const definitions */
const EVENT_NAME = 'readVoicesFinished';
const DEFAULT_TAG_NAME = 'tag-name';
const DEFAULT_VOICE_ID = 'voice-id';
const DEFAULT_VOICE_IMG = 'voice-img';
const DEFAULT_VOICE_NAME = 'voice-name';
const DEFAULT_OPTION = `<input class="selectopt" name="tag-select" type="radio" id="${DEFAULT_TAG_NAME}"><label for="${DEFAULT_TAG_NAME}" class="option">${DEFAULT_TAG_NAME}</label>`;
const DEFAULT_VOICE = `
    <div class="flex-center voice-container col-4 col-lg-2">
        <img id="${DEFAULT_VOICE_ID}" class="voice-image-container" src="assets/images/${DEFAULT_VOICE_IMG}" alt="Voice image for '${DEFAULT_VOICE_NAME}'" />
        <p class="voice-label">${DEFAULT_VOICE_NAME}</p>
    </div>
`;

/* variables definitions */

/*
 * The next two variables are necessary to start the script after the window has been loaded (so jQuery can reference things on the DOM),
 * and after the JSON has been read.
 */
/** Determines if the JSON file containing the data has been read. */
let jsonHasBeenRead = false;
/** Determines if the window.onload function has been called. */
let windowLoaded = false;

/** Contains the raw data from the JSON file. It's necessary for it to be global. */
let voices = [];

// No need to wait for the window to load to read the JSON file, we can do that while it renders.
getVoices();

window.onload = () => {
    windowLoaded = true;
    // If the JSON file has been read, the script can start to process the data.
    if (jsonHasBeenRead) {
        processData();
    }
};

// 'getVoices' will dispatch an event, and here we listen to it.
document.addEventListener(EVENT_NAME, (voices) => {
    // The event has been dispatched, meaning the JSON has been read. If the window has also been loaded, we can start processing the data obtained.
    if (windowLoaded) {
        processData();
    }
}, false);

/** Gets the data from the JSON thanks to jQuery. Dispatches an event once it's done, and sets 'jsonHasBeenRead' to true. */
function getVoices() {
    $.getJSON( "assets/data/voices.json", (data) => {
        voices = data;
        jsonHasBeenRead = true;
        const readVoicesFinishedEvent = new Event(EVENT_NAME);
        document.dispatchEvent(readVoicesFinishedEvent);
    });
}

/** Processes the data obtained from the JSON, printing the voices, tags, etc. */
function processData() {
    injectVoices();
    processTags();
}

function processTags() {
    const tags = getTags();
    injectTags(tags);
}

/**
 * Gets the tags for the voices array. Returns a Set of strings containing the tags.
 * 
 * At first I made this function to return an array, not a set. Then I realized that using a tag in this case, where we don't want any element
 * repeated, using a Set made the code easier to read and reduced the size of the function. The old function can be found on the README.md.
 */
function getTags() {
    let tags = new Set();
    if (voices && voices.length > 0) {
        voices.filter(voice => voice.tags && voice.tags.length > 0).forEach(voice => {
            if (tags.size == 0) {
                tags = new Set(voice.tags);
            } else {
                voice.tags.forEach(tag => tags.add(tag));
            }
        });
    }
    return tags;
}

function injectVoices() {
    const voicesContainer = $('div.pro-container div.row');
    if (voicesContainer) {
        const voicesHtml = [];
        let voiceHtml = DEFAULT_VOICE;
        if (voices && voices.length > 0) {
            voices.forEach(voice => {
                voiceHtml = DEFAULT_VOICE.replaceAll(DEFAULT_VOICE_ID, voice.id).replaceAll(DEFAULT_VOICE_IMG, voice.icon).replaceAll(DEFAULT_VOICE_NAME, voice.name);
                voicesHtml.push(voiceHtml);
            });
        }
        voicesContainer.append(voicesHtml);
    }    
}

/** Inserts the tags on the HTML. */
function injectTags(tags) {
    const tagSelect = $('#tag-select');
    if (tagSelect) {
        const options = [];
        for (let tag of tags) {
            options.push(DEFAULT_OPTION.replaceAll(DEFAULT_TAG_NAME, tag));
        }
        tagSelect.append(options);
    }
}


/** 
 * Old getTags function, using the built-in functions of arrays.
 * 

*/