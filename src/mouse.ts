import { Assignment, ButtonType } from "midi-mixer-plugin";
import { Hardware, MouseButton, Virtual } from "keysender";

const handle = new Hardware("Midi-Mixer-PTT");

interface PTTMouseButton {
    mouseButton: MouseButton;
    pushButton: ButtonType;
    releaseButton: ButtonType;
    tapButton: ButtonType;
}

let buttons: PTTMouseButton[] = [];

function initMouseButtons() {
    let mouseButtons: MouseButton[] = ['left', 'right', 'middle'];

    for (let mouseButton of mouseButtons) {
        let butt: PTTMouseButton = {
            mouseButton,
            pushButton: new ButtonType(`PushButton${mouseButton}`, {
                name: `${mouseButton} mouse down`,
                active: true,
            }),
            releaseButton: new ButtonType(`ReleaseButton${mouseButton}`, {
                name: `${mouseButton} mouse up`,
                active: true,
            }),
            tapButton: new ButtonType(`TapButton${mouseButton}`, {
                name: `${mouseButton} mouse tap`,
                active: true,
            }),
        }

        butt.pushButton.on("pressed", () => {
            handle.mouse.toggle(mouseButton, true);
        });

        butt.releaseButton.on("pressed", () => {
            handle.mouse.toggle(mouseButton, false);
        });

        butt.tapButton.on("pressed", () => {
            handle.mouse.click(mouseButton);
        });

        buttons.push(butt);
    }
}

function initMouseMovement(relative: boolean = false) {
    let xMouseAssignment = new Assignment(`MouseXControl`, {
        name: `Mouse X Control`,
        volume: 0.5,
        assigned: false,
    });

    xMouseAssignment.on("volumeChanged", (level: number) => {
        let val = 20;

        if (relative) {
            let t = 0.5 - level;
            // *2 for 0-1 values, 10 for scaling
            t = t * 2 * 10;
            // change to - for correct directional movement
            val = t * -val;
        }
        else {
            if (level < 0.5) {
                val = -val
            }
            else {
            }
        }

        if (xMouseAssignment.muted) {
            val = val / 4
        }

        handle.mouse.move(val, 0);
    })

    xMouseAssignment.on("assignPressed", () => {
        handle.mouse.click('left');
    })

    xMouseAssignment.on("mutePressed", () => {
        xMouseAssignment.muted = !xMouseAssignment.muted
    })

    let yMouseAssignment = new Assignment(`MouseYControl`, {
        name: `Mouse Y Control`,
        volume: 0.5,
        assigned: false,
    });

    yMouseAssignment.on("volumeChanged", (level: number) => {
        let val = 20;

        if (relative) {
            let t = 0.5 - level;
            // *2 for 0-1 values, 10 for scaling
            t = t * 2 * 10;
            val = t * val;
        }
        else {
            if (level < 0.5) {
            }
            else {
                val = -val
            }
        }


        if (yMouseAssignment.muted) {
            val = val / 4
        }

        handle.mouse.move(0, val);
    })

    yMouseAssignment.on("assignPressed", () => {
        handle.mouse.click('right');
    })

    yMouseAssignment.on("mutePressed", () => {
        yMouseAssignment.muted = !yMouseAssignment.muted
    })
}

export function initMouse(relative: boolean = false) {
    initMouseButtons();
    initMouseMovement(relative);
}
