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
const PRO_CONTAINER = 'pro-container';
const FAV_CONTAINER = 'favourite-container';
const VOICE_IMAGE_CONTAINER = 'voice-image-container';
const FAV_ICON_CONTAINER = 'fav-icon-container';
const FAV_ICON = 'fav-icon';
const SORT_ICON = 'sort-icon';
const DEFAULT_OPTION = `<input class="selectopt" name="tag-select" type="radio" id="${DEFAULT_TAG_NAME}" value="${DEFAULT_TAG_NAME}"><label for="${DEFAULT_TAG_NAME}" class="option">${DEFAULT_TAG_NAME}</label>`;
const DEFAULT_VOICE = `

    <div class="flex-center voice-container col-6 col-sm-4 col-md-3 col-xl-2 ${PREFIX_ID}${DEFAULT_VOICE_ID}">
        <div class="icon-container ${FAV_ICON_CONTAINER} flex-center">
            <div id="${FAV_ICON}" class="icon ${FAV_ICON} flex-center"></div>
        </div>
        <div class="${VOICE_IMAGE_CONTAINER}">
            <img src="assets/images/${DEFAULT_VOICE_IMG}" alt="Voice image for '${DEFAULT_VOICE_NAME}'" />
        </div>
        <p class="voice-label">${DEFAULT_VOICE_NAME}</p>
    </div>
`;
const SORT_ASC = 'asc';
const SORT_DESC = 'desc';
const SELECTED_CLASS = 'selected';
const HOVERED_CLASS = 'hovered';
const REVERSE_CLASS = 'reverse';
const TAG_ALL = 'all';
const VOICES_JSON_FILE = 'assets/data/voices.json';

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

let sorting = null;

let currentTag = TAG_ALL;
let currentFilter = null;
let selectedVoiceId = null;

// No need to wait for the window to load to read the JSON file, I can do that while it renders.
getVoices();

/* LISTENERS */

/** Detects when the sort icon has been clicked. */
function sortClickListener() {
    $(`#${SORT_ICON}`).on('click', function () {
        onSortClicked();
    });
}

/** Detects when the random icon has been clicked and chooses a random voice from the filtered ones as being used. */
function randomClickListener() {
    $('#random-icon').on('click', function () {
        onRandomClicked();
    });
}

/** Controls if a tag option has been clicked. */
function tagClickListener() {
    $('#tag-select .option').on('click', function () {
        onTagClicked();
    });
}

/** Detects when something is written on the search bar. */
function searchBarListener() {
    $(`#search-bar`).on('input', function () {
        onSearch(this);
    });
}

/** Detects when the voice image has been clicked and calls 'onVoiceClicked'. */
function voiceClickListener(id, container) {
    $(`.${container} .${PREFIX_ID}${id} .${VOICE_IMAGE_CONTAINER}`).on('click', function () {
        onVoiceClicked(id);
    });
}

/** Detects the hover on the class, and puts the 'hovered' class on both inputs. */
function hoverListener(id, container, hoveredClass, otherClass) {
    $(`.${container} .${PREFIX_ID}${id} .${hoveredClass}`).on({
        mouseenter: function () {
            onMouseEnter(this, otherClass);
        },
        mouseleave: function () {
            onMouseLeave(this, otherClass);
        },
    });
}

/** Detects the click on the fav icon. */
function favIconClickListener(id, container) {
    $(`.${container} .${PREFIX_ID}${id} .${FAV_ICON_CONTAINER}`).on('click', function () {
        onFavIconClick(this);
    });
}

/** Filters the list so it only shows the filtered values. */
function onSearch(element) {
    currentFilter = $(element).val();
    filterAllVoices();
}

window.onload = () => {
    windowLoaded = true;
    // If the JSON file has been read, the script can start to process the data.
    if (jsonHasBeenRead) {
        processData();
    }
};

// 'getVoices' will dispatch an event, and here I listen to it.
document.addEventListener(
    EVENT_NAME,
    () => {
        // The event has been dispatched, meaning the JSON has been read. If the window has also been loaded, I can start processing the data obtained.
        if (windowLoaded) {
            processData();
        }
    },
    false
);

/** Gets the data from the JSON thanks to jQuery. Dispatches an event once it's done, and sets 'jsonHasBeenRead' to true. */
function getVoices() {
    $.getJSON(VOICES_JSON_FILE, (data) => {
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
    injectVoices(PRO_CONTAINER, filteredVoices);
    sortClickListener();
    randomClickListener();
    searchBarListener();
}

/** Does all the tags stuff. */
function processTags() {
    const tags = getTags();
    injectTags(tags);
    tagClickListener();
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
        voices
            .filter((voice) => voice.tags)
            .forEach((voice) => {
                if (tags.size == 0) {
                    tags = new Set(voice.tags);
                } else {
                    voice.tags.forEach((tag) => tags.add(tag));
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
        const orderedVoices = sortVoices(voices);
        orderedVoices.forEach((voice) => {
            voiceHtml = DEFAULT_VOICE.replaceAll(DEFAULT_VOICE_ID, voice.id)
                .replaceAll(DEFAULT_VOICE_IMG, voice.icon)
                .replaceAll(DEFAULT_VOICE_NAME, voice.name);
            voicesContainer.append(voiceHtml);

            // If we are injecting favourites, then it has to be already selected.
            if (container === FAV_CONTAINER) {
                $(`.${PREFIX_ID}${voice.id} .${FAV_ICON}`).each(function () {
                    $(this).addClass(SELECTED_CLASS);
                });
                // Check if the one from the non-favourites is selected.
                if ($(`.${PRO_CONTAINER} .${PREFIX_ID}${voice.id}`).classList().includes(SELECTED_CLASS)) {
                    $(`.${container} .${PREFIX_ID}${voice.id}`).addClass(SELECTED_CLASS);
                }
            }

            controlEvents(voice.id, container);
        });
    }
}

function sortVoices(voices) {
    let orderedVoices = [...voices];
    if (voices && sorting) {
        orderedVoices = orderedVoices.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        });
        if (sorting === SORT_DESC) {
            orderedVoices = orderedVoices.reverse();
        }
    }
    return orderedVoices;
}

/** Removes the content from the HTML. */
function removeVoices(container, voices) {
    const voicesContainer = $(`.${container} .row`);
    if (voicesContainer) {
        voices.forEach((voice) => {
            voicesContainer.find(`.${PREFIX_ID}${voice.id}`).remove();
        });
    }
}

/** Controls the clicks and hovers for the element. */
function controlEvents(id, container) {
    voiceClickListener(id, container);
    favIconClickListener(id, container);
    hoverListener(id, container, VOICE_IMAGE_CONTAINER, FAV_ICON_CONTAINER);
    hoverListener(id, container, FAV_ICON_CONTAINER, VOICE_IMAGE_CONTAINER);
}

/** Filters the voices by hiding all of them first, and then showing the filtered ones. */
function filterVisibleContent(container, voices) {
    const voicesContainer = $(`.${container} .row`);
    if (voicesContainer) {
        voicesContainer.children().hide();
        // Search for the elements and show them.
        voices.forEach((voice) => {
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
    let id = classes.find((clas) => clas.includes(`${PREFIX_ID}`));
    if (id) {
        id = id.replace(PREFIX_ID, '');
    }
    return id;
}

/** Removes the 'selected' class from the voice that was selected. */
function unselectOldVoice() {
    if (selectedVoiceId) {
        $(`.${PREFIX_ID}${selectedVoiceId}`).removeClass(SELECTED_CLASS);
    }
}

/** Marks the voice as 'selected' by the voice ID. It marks it both on the list and favourites. */
function selectVoice(id) {
    selectedVoiceId = id;
    $(`.${PREFIX_ID}${id}`).each(function () {
        $(this).addClass(SELECTED_CLASS);
    });
}

/** Sorts by the voice name.
 *
 * In order to sort, the code first sets the 'sorting' variable, then removes every voice from the DOM, to add it again but this time sorted.
 *
 * This could be done by moving the elements with jQuery, but I found this way to be easier to read.
 *
 * Then it does the same for the favourites, if there is any.
 *
 * After that, since it was re-painted, it's necessary for it to filter again the lists, and mark the voice as selected if there was one being used. */
function onSortClicked() {
    setSorting();

    removeVoices(PRO_CONTAINER, voices);
    injectVoices(PRO_CONTAINER, voices);
    if (favVoices.length > 0) {
        removeVoices(FAV_CONTAINER, favVoices);
        injectVoices(FAV_CONTAINER, favVoices);
    }

    // Filters by tag since we re-painted everything without filters, so everything is still ordered even after changing the filters.
    filterVoices(voices, PRO_CONTAINER);
    filterVoices(favVoices, FAV_CONTAINER);

    // Must remark as selected if it was selected
    if (selectedVoiceId) {
        selectVoice(selectedVoiceId);
    }
}

/** Sets the sorting, both the icon and the sorting value. */
function setSorting() {
    // add the 'selected' class
    if (sorting === null) {
        $(`#${SORT_ICON}`).parent().addClass(SELECTED_CLASS);
    }
    sorting = getNewSortingValue();
    setReverseClass();
}

/** Returns the new sorting value based on the old value. */
function getNewSortingValue() {
    if (sorting === SORT_ASC) {
        return SORT_DESC;
    } else {
        return SORT_ASC;
    }
}

/** Adds the 'reverse' class to the sorting icon depending on the current sorting. */
function setReverseClass() {
    if (sorting === SORT_DESC) {
        $(`#${SORT_ICON}`).addClass(REVERSE_CLASS);
    } else {
        $(`#${SORT_ICON}`).removeClass(REVERSE_CLASS);
    }
}

function onRandomClicked() {
    // Only one option to choose from. If it's already checked, then do nothing. Otherwise, select it.
    if (filteredVoices.length === 1 && selectedVoiceId !== filteredVoices[0].id) {
        onVoiceClicked(filteredVoices[0].id);
    } else {
        // Here we have many options to choose from.
        // Filter the array so the random choice won't be the same one we have selected.
        const randomVoices = filteredVoices.filter((voice) => voice.id !== selectedVoiceId);
        if (randomVoices && randomVoices.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomVoices.length);
            const randomVoice = randomVoices[randomIndex];
            onVoiceClicked(randomVoice.id);
        }
    }
}

/** Sets the current tag to the one selected. Filters the arrays by the tag. */
function onTagClicked() {
    // The timeout without time is needed to wait for the DOM to change the checked value.
    setTimeout(() => {
        currentTag = $('input[name=tag-select]:checked').val();
        filterAllVoices();
    });
}

/** Unselects the current voice, and selects the chosen one. If the old selected is the same as the new selected, then it only unselects. */
function onVoiceClicked(id) {
    unselectOldVoice();

    // If it is the same id, the 'selected' class does not have to be added.
    if (selectedVoiceId == id) {
        selectedVoiceId = null;
    } else {
        selectVoice(id);
    }
}

/** Adds the class hovered to the element and the child with 'otherClass'. */
function onMouseEnter(element, otherClass) {
    $(element).addClass(HOVERED_CLASS);
    $(element).parent().find(`.${otherClass}`).addClass(HOVERED_CLASS);
}

/** Removes the class hovered to the element and the child with 'otherClass'. */
function onMouseLeave(element, otherClass) {
    $(element).removeClass(HOVERED_CLASS);
    $(element).parent().find(`.${otherClass}`).removeClass(HOVERED_CLASS);
}

/** If it is already on the fav list, then it removes the item from it. Otherwise, it's added to the list. */
function onFavIconClick(element) {
    const id = getId(element);
    if (favVoices && favVoices.map((voice) => voice.id).includes(id)) {
        const voice = removeFav(id, this);
        removeVoices(FAV_CONTAINER, [voice]);
    } else {
        const voice = addFav(id, this);
        if (sorting) {
            // If it's sorting, the easier way to do it is to remove all voices, and then inject them back, since the inject funcion will order them.
            removeVoices(FAV_CONTAINER, favVoices);
            injectVoices(FAV_CONTAINER, favVoices);
            filterAllVoices();
        } else {
            injectVoices(FAV_CONTAINER, [voice]);
        }
    }
    filteredFavVoices = [...favVoices];
    showOrHideFavContainer();
}

/** Adds a voice to the fav list and sets the 'selected' class for that voice. Returns the added voice. */
function addFav(id, element) {
    const voice = filteredVoices.find((voice) => voice.id === id);
    favVoices.push(voice);
    $(element).find(`.${FAV_ICON}`).addClass(SELECTED_CLASS);
    return voice;
}

/** Removes the id from the fav array and removes the class 'selected' from the pro list. Returns the removed voice. */
function removeFav(id) {
    const favVoice = favVoices.find((voice) => voice.id === id);
    favVoices.splice(favVoices.indexOf(favVoice), 1);
    $(`.${PRO_CONTAINER} .${PREFIX_ID}${id} .${FAV_ICON_CONTAINER} .${FAV_ICON}`).removeClass(SELECTED_CLASS);
    return favVoice;
}

/** Shows or hides the fav contaner based on the array of filtered fav voices length. */
function showOrHideFavContainer() {
    if (filteredFavVoices && filteredFavVoices.length > 0) {
        $(`.${FAV_CONTAINER}`).show();
    } else {
        $(`.${FAV_CONTAINER}`).hide();
    }
}

/** Filters both the fav voices and the pro voices. */
function filterAllVoices() {
    filteredVoices = filterVoices(voices, PRO_CONTAINER);
    filteredFavVoices = filterVoices(favVoices, FAV_CONTAINER);
}

/** Filters the voice by a tag value. If the tag is 'all', then it restores the filter, showing all the voices. */
function filterVoices(array, containerClass) {
    let filteredArray = [...array];
    if (currentTag.toLowerCase() !== TAG_ALL) {
        filteredArray = filteredArray.filter((voice) => voice.tags && voice.tags.includes(currentTag));
    }
    if (currentFilter) {
        filteredArray = filteredArray.filter((voice) => voice.name && voice.name.toLowerCase().includes(currentFilter));
    }
    filterVisibleContent(containerClass, filteredArray);
    return filteredArray;
}

/* JQUERY EXTRA FUNCTIONALITIES */

/** Function to get an array with the CSS classes of a jQuery element. */
$.fn.classList = function () {
    return this[0].className.split(/\s+/);
};
