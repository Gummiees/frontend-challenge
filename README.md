# frontend-challenge

In this code I **do not** try to make it work in IE. If so, I would have to use older JS and not ES6.

I tested the code for Chrome, Firefox, Edge and Opera (latest versions for each). Couldn't try on Safari since I don't have a Mac.

https://gummiees.github.io/frontend-challenge/
## TODO

- Transition and some CSS transform when adding/removing favourites.
- Header must be responsive.
- Collapse panels on mobile version.
- Show fav button on mobile version.
  
## EXTRAS

At first I made the `getTags` function to return an Array, not a Set. Then I realized that, since I don't want any element repeated, using a Set made the code easier to read, and reduced the size of the function.

This is the older version:

```javascript
function getTags(voices) {
    let tags = [];
    if (voices && voices.length > 0) {
        // This is only to demonstrate knowledge on built-in functions for the array. It would be faster to simply do a forEach.
        // That is beacause with 'filter', 'map', 'some' and 'includes', it ends up doing a similar functionality to 'forEach', and so this code is
        // making unnecesary loops. With a simple 'forEach' I can treat the array inside of it with 'ifs' for instance.
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
```