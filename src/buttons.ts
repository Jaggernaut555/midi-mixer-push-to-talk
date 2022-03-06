import { ButtonType } from "midi-mixer-plugin";
import { KeyButton, KeysDown, KeysTap, KeysUp, parseKeycode } from "./utils";

interface PTTButton {
    keyButton: KeyButton;
    pushButton: ButtonType;
    releaseButton: ButtonType;
    tapButton: ButtonType;
}

let buttons: PTTButton[] = [];
export function initButtons(list: string) {
    let codes = list.split(',');

    for (let codeString of codes) {

        let kb = parseKeycode(codeString);

        if (!kb) {
            console.log(`Skipping invalid entry`)
            continue;
        }
        let keyButton = kb;

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
            KeysDown(keyButton.codes)
        });

        butt.releaseButton.on("pressed", () => {
            KeysUp([...keyButton.codes].reverse())
        });

        butt.tapButton.on("pressed", () => {
            for (let i = 0; i < keyButton.multiplier; i++) {
                KeysTap(keyButton.codes)
            }
        });

        buttons.push(butt);
    }
}

export function removeButtons() {
    for (let b of buttons) {
        b.pushButton.remove();
        b.releaseButton.remove();
        b.tapButton.remove();
    }
    buttons = [];
}
