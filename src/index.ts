import { Assignment, ButtonType } from "midi-mixer-plugin";
import { KeyButton, KeysDown, KeysTap, KeysUp, parseKeycode } from "./utils";

interface PTTButton {
    keyButton: KeyButton;
    pushButton: ButtonType;
    releaseButton: ButtonType;
    tapButton: ButtonType;
}

let settings: Record<string, any>;
let buttons: PTTButton[] = [];
let codeList: string;

function initButtons(list: string) {
    let codes = list.split(',');

    for (let codeString of codes) {

        let keyButton = parseKeycode(codeString);

        if (!keyButton) {
            console.log(`Skipping invalid entry`)
            continue;
        }

        let butt: PTTButton = {
            keyButton,
            pushButton: new ButtonType(`PushButton${keyButton.name}`, {
                name: `${keyButton.name} key down`,
                active: true,
            }),
            releaseButton: new ButtonType(`ReleaseButton${keyButton.name}`, {
                name: `${keyButton.name} key up`,
                active: true,
            }),
            tapButton: new ButtonType(`TapButton${keyButton.name}`, {
                name: `${keyButton.name} key tap`,
                active: true,
            }),
        }

        butt.pushButton.on("pressed", () => {
            KeysDown(keyButton!.codes, { asScanCode: keyButton!.asScanCode })
        });

        butt.releaseButton.on("pressed", () => {
            KeysUp(keyButton!.codes, { asScanCode: keyButton!.asScanCode })
        });

        butt.tapButton.on("pressed", () => {
            KeysTap(keyButton!.codes, { asScanCode: keyButton!.asScanCode })
        });

        buttons.push(butt);
    }
}

// calling .remove() on the button doesn't seem to actually remove it from the list
$MM.onSettingsButtonPress("updateSettings", () => {
    for (let b of buttons) {
        b.pushButton.remove();
        b.releaseButton.remove();
        b.tapButton.remove();
    }
    buttons = [];

    init();
});

async function init() {
    console.log("initialized");
    settings = await $MM.getSettings();
    codeList = settings["keycode"];
    if (!codeList) {
        codeList = "17";
    }
    console.log(`codelist is: ${codeList}`);
    initButtons(codeList);
}

init();
