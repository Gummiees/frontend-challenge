/** 
 * In this code I do not try to make it work in IE. If so, I would have to use older JS and not ES6.
 * 
 * I tested the code for Chrome, Firefox, Edge and Opera (latest versions for each). Couldn't try on Safari since I don't have a Mac.
 */

/* const definitions */
const EVENT_NAME = 'readVoicesFinished';
const PREFIX_ID = 'voice_';
const DEFAULT_TAG_NAME = 'tag-name';
const DEFAULT_VOICE_ID = 'voice-id';
const DEFAULT_VOICE_IMG = 'voice-img';
const DEFAULT_VOICE_NAME = 'voice-name';
const DEFAULT_OPTION = `<input class="selectopt" name="tag-select" type="radio" id="${DEFAULT_TAG_NAME}" value="${DEFAULT_TAG_NAME}"><label for="${DEFAULT_TAG_NAME}" class="option">${DEFAULT_TAG_NAME}</label>`;
const DEFAULT_VOICE = `

    <div class="flex-center voice-container col-6 col-sm-4 col-md-3 col-xl-2 ${PREFIX_ID}${DEFAULT_VOICE_ID}">
        <div class="fav-icon-container flex-center">
            <div class="fav-icon flex-center"></div>
        </div>
        <div class="voice-image-container">
            <img src="assets/images/${DEFAULT_VOICE_IMG}" alt="Voice image for '${DEFAULT_VOICE_NAME}'" />
        </div>
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
let filteredVoices = [];
let favVoices = [];
let filteredFavVoices = [];

let currentTag = 'all';
let selectedVoiceId = null;

// No need to wait for the window to load to read the JSON file, I can do that while it renders.
getVoices();

window.onload = () => {
    windowLoaded = true;
    // If the JSON file has been read, the script can start to process the data.
    if (jsonHasBeenRead) {
        processData();
    }
};

// 'getVoices' will dispatch an event, and here I listen to it.
document.addEventListener(EVENT_NAME, () => {
    // The event has been dispatched, meaning the JSON has been read. If the window has also been loaded, I can start processing the data obtained.
    if (windowLoaded) {
        processData();
    }
}, false);

/** Gets the data from the JSON thanks to jQuery. Dispatches an event once it's done, and sets 'jsonHasBeenRead' to true. */
function getVoices() {
    $.getJSON('assets/data/voices.json', (data) => {
        voices = data;
        filteredVoices = [...voices];
        jsonHasBeenRead = true;
        const readVoicesFinishedEvent = new Event(EVENT_NAME);
        document.dispatchEvent(readVoicesFinishedEvent);
    });
}

/** Processes the data obtained from the JSON, printing the voices, tags, etc. */
function processData() {
    processVoices();
    processTags();
}

/** Does all the voices stuff. */
function processVoices() {
    injectVoices('pro-container', filteredVoices);
}

/** Does all the tags stuff. */
function processTags() {
    const tags = getTags();
    injectTags(tags);
    onTagClicked();
}

/**
 * Gets the tags for the voices array. Returns a Set of strings containing the tags.
 * 
 * At first I made this function to return an array, not a set. Then I realized that using a tag in this case, where I don't want any element
 * repeated, using a Set made the code easier to read and reduced the size of the function. The old function can be found on the README.md.
 */
function getTags() {
    let tags = new Set();
    if (voices) {
        voices.filter(voice => voice.tags).forEach(voice => {
            if (tags.size == 0) {
                tags = new Set(voice.tags);
            } else {
                voice.tags.forEach(tag => tags.add(tag));
            }
        });
    }
    return tags;
}

/** Injects the HTML code for the voices, cleaning the container div firstly. */
function injectVoices(container, voices) {
    const voicesContainer = $(`.${container} .row`);
    if (voicesContainer) {
        let voiceHtml;
        voices.forEach(voice => {
            voiceHtml = DEFAULT_VOICE.replaceAll(DEFAULT_VOICE_ID, voice.id).replaceAll(DEFAULT_VOICE_IMG, voice.icon).replaceAll(DEFAULT_VOICE_NAME, voice.name);
            voicesContainer.append(voiceHtml);

            // If we are injecting favourites, then it has to be already selected.
            if (container === 'favourite-container') {
                $(`.${container} .${PREFIX_ID}${voice.id} .fav-icon`).addClass('selected');
                // Check if the one from the non-favourites is selected.
                if ($(`.pro-container .${PREFIX_ID}${voice.id}`).classList().includes('selected')) {
                    $(`.${container} .${PREFIX_ID}${voice.id}`).addClass('selected');
                }
            }
            
            controlEvents(voice.id, container);
        });
    }
}

/** Removes the content from the HTML. */
function removeVoices(container, voices) {
    const voicesContainer = $(`.${container} .row`);
    if (voicesContainer) {
        voices.forEach(voice => {
            voicesContainer.find(`.${PREFIX_ID}${voice.id}`).remove();
        });
    }
}

/** Controls the clicks and hovers for the element. */
function controlEvents(id, container) {
    onVoiceClicked(id, container);
    onFavIconClick(id, container);
    onHover(id, container, 'voice-image-container', 'fav-icon-container');
    onHover(id, container, 'fav-icon-container', 'voice-image-container');
}

/** Filters the voices by hiding all of them first, and then showing the filtered ones. */
function filterVisibleContent(container, voices) {
    const voicesContainer = $(`.${container} .row`);
    if (voicesContainer) {
        voicesContainer.children().hide();
        // Search for the elements and show them.
        voices.forEach(voice => {
            const child = voicesContainer.find(`.${PREFIX_ID}${voice.id}`);
            if (child) {
                $(child).show();
            }
        });
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

/** Obtains the ID from the classes of the parent element. */
function getId(element) {
    const classes = $(element).parent().classList();
    let id = classes.find(clas => clas.includes(`${PREFIX_ID}`));
    if (id) {
        id = id.replace(PREFIX_ID, '');
    }
    return id;
}

/** Removes the 'selected' class from the voice that was selected. */
function unselectOldVoice() {
    if (selectedVoiceId) {
        $(`.${PREFIX_ID}${selectedVoiceId}`).removeClass('selected');
    }
}

/** Marks the voice as 'selected' by the voice ID. It marks it both on the list and favourites. */
function selectVoice(id) {
    selectedVoiceId = id;
    $(`.${PREFIX_ID}${id}`).each(function() { $(this).addClass('selected') });
}

/** Controls if a tag option has been clicked. If so, filters the voices by the tag value. */
function onTagClicked() {
    $('#tag-select .option').on('click', function() {
        // The timeout without time is needed to wait for the DOM to change the checked value.
        setTimeout(() => {
            currentTag = $('input[name=tag-select]:checked').val();
            filteredVoices = filterVoicesByTag(voices, 'pro-container');
        });
      });
}

/** Detects when the voice image has been clicked, unselects the current one, and selects the chosen one.
 * 
 * If the old selected is the same as the new selected, then it only unselects.
 */
function onVoiceClicked(id, container) {
    $(`.${container} .${PREFIX_ID}${id} .voice-image-container`).on('click', function() {
        unselectOldVoice();

        // If it is the same id, the 'selected' class does not have to be added.
        if (selectedVoiceId == id) {
            selectedVoiceId = null;
        } else {
            selectVoice(id);
        }
    });
}

/** Detects the hover on the class, and puts the 'hovered' class on both inputs. */
function onHover(id, container, hoveredClass, otherClass) {
    $(`.${container} .${PREFIX_ID}${id} .${hoveredClass}`).on({
        mouseenter: function () {
            $(this).addClass('hovered');
            $(this).parent().find(`.${otherClass}`).addClass('hovered');
        },
        mouseleave: function () {
            $(this).removeClass('hovered');
            $(this).parent().find(`.${otherClass}`).removeClass('hovered');
        }
    });
}

/** Detects the click on the fav icon.
 * 
 * If it is already on the fav list, then it removes the item from it. Otherwise, it's added to the list.
 */
function onFavIconClick(id, container) {
    $(`.${container} .${PREFIX_ID}${id} .fav-icon-container`).on('click', function() {
        const id = getId(this);
        if (favVoices && favVoices.map(voice => voice.id).includes(id)) {
            const voice = removeFav(id, this);
            removeVoices('favourite-container', [voice]);
        } else {
            const voice = addFav(id, this);
            injectVoices('favourite-container', [voice]);
        }
        filteredFavVoices = [...favVoices];
        showOrHideFavContainer();
    });
}

function addFav(id, element) {
    const voice = filteredVoices.find(voice => voice.id === id);
    favVoices.push(voice);
    $(element).find('.fav-icon').addClass('selected');
    return voice;
}

function removeFav(id, element) {
    const favVoice = favVoices.find(voice => voice.id === id);
    favVoices.splice(favVoices.indexOf(favVoice), 1);
    $(element).find('.fav-icon').removeClass('selected');
    return favVoice;
}

function showOrHideFavContainer() {
    if (filteredFavVoices && filteredFavVoices.length > 0) {
        $('.favourite-container').show();
    } else {
        $('.favourite-container').hide();
    }
}

/** Filters the voice by a tag value. If the tag is 'all', then it restores the filter, showing all the voices. */
function filterVoicesByTag(array, containerClass) {
    let filteredArray;
    if (currentTag.toLowerCase() === 'all') {
        filteredArray = [...array];
    } else {
        filteredArray = array.filter(voice => voice.tags.includes(currentTag));
    }
    filterVisibleContent(containerClass, filteredArray);
    return filteredArray;
}

$.fn.classList = function() { return this[0].className.split(/\s+/); };