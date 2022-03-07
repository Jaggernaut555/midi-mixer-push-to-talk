# Push-To-Talk

Want to be able to make a button that presses a key and holds until the button is released? Want to use a non-standard keyboard button? This may be the plugin for you.

Keycode list available here: [https://keycode.info/](https://keycode.info/). Note that firefox results are wrong on some characters. Chrome or Edge should be used.

Code list on settings can look something like this:

```65,124(F13),17+90(undo)```

This creates buttons for 3 different key code combinations.

Each combination is separated by a comma (`,`) and will create buttons for "key down", "key up", and "key tap". The down and up buttons are designed to be used with midi devices that send a message on button push and button release. "key tap" is used to press and release the specified keycodes in an instant. You can combine as many key codes as you feel like by adding a `+` between them. You can also add a tilde before a keycode (e.g. `~65+~68`) to press the key as a scan code. Using as a scan code is what you likely want if you're pressing arrow keys or home/end/insert/delete.

## Wheels

You can also create "wheels". These should only be used on infinite rotary encoders as behaviour on faders or limited rotation encoders will not be useful. The following is an example of a wheel code. You can create multiple wheels separated by commas.

```~37(left)[~40(down)]/~39(right)[~38(up)]```

This creates a wheel that presses the left arrow key on volume down and the right arrow on volume up. On pressing the `assign` button it will toggle to pressing the down arrow on volume down and up arrow on volume up.

A wheel requires a volume up and down argument separated by a forward slash `/`. Each side of the divider follows the same rules as regular key codes described above. By pressing the `assign` button of a group you can toggle between up to two sets of keycodes for volume up and down. You can add another keycode in square brackets to either or both sides of the divider to specify the alternate keycodes (e.g. `~37(left)[~40(down)]/~39(right)[~38(up)]` will let you toggle between left/right arrow keys and down/up arrow keys). The names specified for each code will be what shows in the dropdown menu. (e.g. `Wheel left/right (down/up)`). A detailed example can be found below.

### Explanation of example setting

`65` creates buttons that will press the `a` key. They will show up as `65 key down`, `65 key up`, and `65 key tap`.

`124(F13)` creates buttons that will press the `F13`. The `(F13)` means the button will show up as `F13 key down`, `F13 key up`, and `F13 key tap`.

`17+90(undo)` creates buttons that will press the `ctrl` and `z` keys. The `(undo)` means the button will show up as `undo key down`, `undo key up`, and `undo key tap`

`16+~37(ctrl+left)[~37*3(left*3)]/16+~39(ctrl+right)[~39*3(right*3)]` creates a wheel that will press ctrl (`16`) and left (`~37`) when volume is turned down and ctrl (`16`) and right (`~39`) when volume is turned up. When `assign` is toggled the alternate codes sent will be left (`~37`) three times (`*3`) and right (`~39`) three times (`*3`). The name of this wheel will show up as `Wheel ctrl+left/ctrl+right (left*3/right*3)`.

This package uses:
- [midi-mixer-plugin](https://github.com/midi-mixer/midi-mixer-plugin)
- [ffi-napi](https://github.com/node-ffi-napi/node-ffi-napi)
- [ref-array-napi](https://github.com/Janealter/ref-array-napi#readme)
- [keycode](https://github.com/timoxley/keycode)