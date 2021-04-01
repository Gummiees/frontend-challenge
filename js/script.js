/** 
 * In this code I do not try to make it work in IE. If so, I would have to use older JS and not ES6.
 * 
 * I tested the code for Chrome, Firefox, Edge and Opera (latest versions for each). Couldn't try on Safari since I don't have a Mac.
 */

start();

const DEFAULT_TAG_NAME = 'tag-name';
const DEFAULT_OPTION = `<input class="selectopt" name="tag-select" type="radio" id="${DEFAULT_TAG_NAME}"><label for="${DEFAULT_TAG_NAME}" class="option">${capitalize(DEFAULT_TAG_NAME)}</label>`;

async function start() {
    const voices = await getVoices();
    console.log('voices', voices);
    processTags(voices);
}

/** Gets the data from the JSON thanks to jQuery. */
async function getVoices() {
    return new Promise((accept) => {
        $.getJSON( "assets/data/voices.json", (data) => accept(data));
    });
}

function processTags(voices) {
    const tags = getTags(voices);
    injectTags(tags);
}

/** Gets the tags for the voices array. Returns an array of strings containing the tags. */
function getTags(voices) {
    let tags = [];
    if (voices && voices.length > 0) {
        /* 
         * This is only to demonstrate knowledge on built-in functions for the array. It would be faster to simply do a forEach.
         * That is beacause with 'filter', 'map', 'some' and 'includes', it ends up doing a similar functionality to 'forEach', and so this code is
         * making unnecesary loops. With a simple 'forEach' we can treat the array inside of it with 'ifs' for instance.
         */
        voices.filter(voice => voice.tags && voice.tags.length > 0).map(voice => voice.tags).forEach(voiceTags => {
            if (tags.length == 0 || !voiceTags.some(voiceTag => tags.includes(voiceTag))) {
                tags = tags.concat(voiceTags); // Could also be done with [...tags, ...voiceTags] for instance.
            } else {
                voiceTags.filter(voiceTag => !tags.includes(voiceTag)).forEach(voiceTag => voiceTag.push(voiceTag));
            }
        });
    }

    return tags;
}

/** Inserts the tags on the HTML. */
function injectTags(tags) {
    const tagSelect = $('#tag-select');
    if (tagSelect) {
        const options = [];
        tags.forEach(tag => {
            // Tried to capitalize the letter via CSS with '::first-letter' and 'transform: uppercase', but it wouldn't work since it has a ':before'.
            options.push(DEFAULT_OPTION.replaceAll(DEFAULT_TAG_NAME, tag).replaceAll(capitalize(DEFAULT_TAG_NAME), capitalize(tag)));
        });
    
        tagSelect.append(options);
    }
}

/** Capitalizes the first letter of a string. */
function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }