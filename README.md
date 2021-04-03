# frontend-challenge

In this code I **do not** try to make it work in IE. If so, I would have to use older JS and not ES6.

I tested the code for Chrome, Firefox, Edge and Opera (latest versions for each). Couldn't try on Safari since I don't have a Mac.

https://gummiees.github.io/frontend-challenge/
## TODO

- Header must be responsive.
- Collapse panels on mobile version.
- Transition and some CSS transform when adding/removing favourites.
- `input[type='search']::-webkit-search-cancel-button` does not work for Mozilla. Implement a function where, if Mozilla, add HTML to the DOM displaying it, plus making a function that removes the text from the input. Basically do it manually.

## CODING PROCESS

The steps I made was first do the mockup on plain HTML + CSS. Then converted to CSS3 variables. After that, I started with the JavaScript. While working with JavaScript, I also started to transform the CSS for mobile, doing 'mobile-first', so the media queries were not made with `max-with`, but with `min-width`.

One important thing to know is that the selector for 'Popular/Newest' doesn't do anything, neither the icon with an eye. They have been developed with the same characteristics as the other selector or icons, but they do nothing since was not specified what the icon should do, and since the voices do not have creation dates or fav counts to order them. 

If they would, the ordering could be applied depending on this selector, so if you are selecting "Newest" and ascending, newers will come first. If it's descending, then the newers will come last.

## CSS

I tried to do the application as much pixel-pefect as I could in the given amount of time.

### W3C Validation

I tested the CSS code on https://jigsaw.w3.org/css-validator/, and ignoring the Bootstrap file, the problems come from `-webkit-mask`, which is not a standar feature (but implemented on all browsers I tested), and from `linear-gradient`, which I do not really understand since my code is `linear-gradient(45deg, color1, color2)` and the W3C validation is `linear-gradient([ [ [ <angle> | to [top | bottom] || [left | right] ],]? <color-stop>[, <color-stop>]+);`. I found this [on the MDN website](https://developer.mozilla.org/es/docs/Web/CSS/linear-gradient()), I was not able to find the official W3C definition on the W3C website.

Also tested the HTML on https://validator.w3.org/, and no errors were found! 🎉

### ANIMATIONS

I added some **small animations**, not only to make it clearer, but also to make sure the user understands he did something, since he have time to see the effect on the icon. For example, on the sorting one:

![CSS sorting effect](https://media.giphy.com/media/vW1lDM2EIA1xDU9S0x/giphy.gif)

As you can see on the image, I also made **the icons change color when being used or hovered/clicked**. This is to make sure the user understands, in this case, that the sorting is currently being applied. the hover is for the user to know that the button will do something.

An other small animation is the one for the caret on the selectors:

![CSS caret effect](https://media.giphy.com/media/Xm1QZ7tsHs8hEUpaad/giphy.gif)


### SVG ICONS 

An other important thing, is that, at first, I was changing the icons (SVG images) within the SVG itself, not with CSS, since it was within an `<img />` tag. The problem with this is that, when I had to change the color, I had no way of doing so. Certainly I can use `fill` or `stroke` on CSS, but these only would apply if I put the SVG as an string, not a URL on the `img`, so I had to think about a workaround.

The best option was to use `mask`. That meant changing the HTML structure, which meant changing the JS code with the jQuery selectors, plus changing all the CSS related to it. Thankfully it didn't take much effort. Now I was able to change the SVG color by changing the mask container background color! 🎉

### FAV BUTTON

The fav button was supposed to appear on hover, and that is how it works for non-touchable screens. However, if the screen is touchable, while is true that you can simulate the 'hover' effect by a long press over the element on a touchable screen, I found that to be counter intuitive. Not only that, but it also selected the voice, which in a real case would not be the desired effect. Also, the user might not have an easy time to find out that they can add to favourites by long pressing the voice, that means that it will need an introduction text explaining so, which basically means bad design. Furthermore, if you long press, the device thinks you want to save the voice image. Again, bad design.

After realizing all of that, it was clear that it had to be changed, and I went for the easier step for both the user and me, always show the fav button on touchable screens. 

Fav button for non-touchable screens:

![Fav button for non-touchable screens](https://media.giphy.com/media/Q1MBhGQRh51Lg3MjNY/giphy.gif)

Fav button for touchable screens:

![Fav button for touchable screens](https://media.giphy.com/media/mzVaLWHQSQPUYkp2yJ/giphy.gif)

### FONTS

Since there was no reference about what font was being used on the mockup, I went to Google Fonts and picked the one I found most similar. Not exactly the same, but it does the job. If this was a real case, I would ask for the font used to the UI/UX team, and if it was not free, then I would ask for them to send me the font files so I can reference them on the CSS, plus make sure that we have the license for it.


### SELECTORS

Honestly, I never had to deal with this before. I usually just go for Bootstrap, or since I have mostly worked with Angular with PrimeNG, use the ones they give you. I didn't know what a pain dealing with this can be. I found one design online that only used HTML and CSS, thanks to using radio buttons. That's a cool trick, and it was similar to what I needed, so I just changed the CSS so it would look as desired.

It has one problem in my opinion though, which is that the option selected does not show up on the dropdown options, it only shows up on the selected one. I don't really know how to explain it, but I think it's better if the options are always static, so no matter the one you have chosen, if you click on the selector, there will appear the same options in the same order.

Let's say we have A, B, C on the selector, in that order. I select B. Now the selector will appear as B, A, C, since the selected one goes to the top. This could be confusing for the user, but since I have limited time, I prefered to stick to this one rather than implementing something new.

## JAVASCRIPT DETAILS

### RANDOM VOICE

I made the function so it will not choose the same random voice you already have active. Furthermore, if for any given reason there comes a time where you filter by a tag, and that tag only has one voice, and for whatever reason the user wants to go random with one choice, it will apply that choice and not deactivate it, no matter how many times you go random.


### FILTERING

In some cases, like for sorting, I chose the easier to code plus easier to understand way, and simply remove all the voices from the DOM, and print them again. For the filtering however, I decided to not do that, and hide all the voices at first, to then show only the filtered ones.

### `getTags`

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

## BOOTSTRAP

I've imported Bootstrap just to use the grid system, which if desired, I could have done by hand, but since it's already done and there was no specified rule that said not to use any external CSS Framework, I decided to use it to save some time.

## jQuery

Same as Bootstrap, I've used to save some time, well, a lot of time in this case. I could have done everything with pure JS, but why do so when you always can work with jQuery? There is no real need of having to use pure JS without jQuery, at least as far as I know. It saves a lot of time, and it does not weight much, no reason not to use it.