# Push-To-Talk

Want to be able to make a button that presses a key and holds until the button is released? Want to use a non-standard keyboard button? This may be the plugin for you.

Keycode list available here: [https://keycode.info/](https://keycode.info/). Note that firefox results are wrong on some characters. Chrome or Edge should be used.

Code list on settings can look something like this:

```65,124(F13),17+90(undo)```

This creates buttons for 3 different key code combinations.

Each combination is separated by a comma (`,`) and will create buttons for "key down", "key up", and "key tap". The down and up buttons are designed to be used with midi devices that send a message on button push and button release. "key tap" is used to press and release the specified keycodes in an instant. You can combine as many key codes as you feel like by adding a `+` between them. You can also add a tilde at the start of a set of keycodes (e.g. `~65+68`) to press the keys as a scan code. If that doesn't mean anything to you don't worry about it.

### Explanation of example setting

`65` creates a buttons that will press the `a` key. They will show up as `65 key down`, `65 key up`, and `65 key tap`.

`124(F13)` creates a button that will press the `F13`. The `(F13)` means the button will show up as `F13 key down`, `F13 key up`, and `F13 key tap`.

`17+90(undo)` creates a button that will press the `ctrl` and `z` keys. The `(undo)` means the button will show up as `undo key down`, `undo key up`, and `undo key tap`


Latest releases of this plugin available [on the project's github page](https://github.com/Jaggernaut555/midi-mixer-push-to-talk/releases/latest)
