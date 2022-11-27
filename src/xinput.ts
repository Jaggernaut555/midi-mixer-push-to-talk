import { Assignment, ButtonType } from 'midi-mixer-plugin';
import ViGEmClient from 'vigemclient';
import { InputAxis } from 'vigemclient/lib/InputAxis';
import { InputButton } from 'vigemclient/lib/InputButton';
import { X360Controller } from 'vigemclient/lib/X360Controller';

interface XinputButton {
    xinputButton: InputButton<X360Controller>;
    pushButton: ButtonType;
    releaseButton: ButtonType;
    tapButton: ButtonType;
}

interface XinputAxis {
    xinputAxis: InputAxis<X360Controller>;
    axisAssignment: Assignment;
}

interface XinputDpad {
    xinputAxis: InputAxis<X360Controller>
    posPushed: boolean;
    negPushed: boolean;
    pushPosButton: ButtonType;
    releasePosButton: ButtonType;
    tapPosButton: ButtonType;
    pushNegButton: ButtonType;
    releaseNegButton: ButtonType;
    tapNegButton: ButtonType;
}

let client: ViGEmClient;
let controller: X360Controller

let buttons: XinputButton[] = [];
let assignments: XinputAxis[] = [];
let dpads: XinputDpad[] = [];

export function initXinput() {
    client = new ViGEmClient();
    let err = client.connect();

    if (err) {
        console.log(err);
        return;
    }

    controller = client.createX360Controller();
    controller.connect()


    createButtonInput(controller.button.A);
    createButtonInput(controller.button.B);
    createButtonInput(controller.button.X);
    createButtonInput(controller.button.Y);

    createButtonInput(controller.button.BACK);
    createButtonInput(controller.button.GUIDE);
    createButtonInput(controller.button.LEFT_SHOULDER);
    createButtonInput(controller.button.LEFT_THUMB, "L3");
    createButtonInput(controller.button.RIGHT_SHOULDER);
    createButtonInput(controller.button.RIGHT_THUMB, "R3");

    createAxisInput(controller.axis.leftX, "Left Joystick X");
    createAxisInput(controller.axis.leftY, "Left Joystick Y");

    createAxisInput(controller.axis.rightX, "Right Joystick X");
    createAxisInput(controller.axis.rightY, "Right Joystick Y");

    createAxisInput(controller.axis.leftTrigger, "Left Trigger", true);
    createAxisInput(controller.axis.rightTrigger, "Right Trigger", true);

    createDpadInput(controller.axis.dpadVert, "up", "down")
    createDpadInput(controller.axis.dpadHorz, "right", "left")
}

function createButtonInput(button: InputButton<X360Controller>, nameOverride: string = "") {

    let name = nameOverride == "" ? button.name : nameOverride;

    let butt: XinputButton = {
        xinputButton: button,
        pushButton: new ButtonType(`Push${name}ButtonXinput`, {
            name: `${name} Button push`,
            active: true,
        }),
        releaseButton: new ButtonType(`Release${name}ButtonXinput`, {
            name: `${name} Button release`,
            active: true,
        }),
        tapButton: new ButtonType(`Tap${name}ButtonXinput`, {
            name: `${name} Button tap`,
            active: true,
        })
    }

    butt.pushButton.on("pressed", () => {
        butt.xinputButton.setValue(true);
    })

    butt.releaseButton.on("pressed", () => {
        butt.xinputButton.setValue(false);
    })

    butt.tapButton.on("pressed", () => {
        butt.xinputButton.setValue(true);
        butt.xinputButton.setValue(false);
    })

    buttons.push(butt);
}

function createAxisInput(axis: InputAxis<X360Controller>, nameOverride: string = "", isTrigger: boolean = false) {

    let name = nameOverride == "" ? axis.name : nameOverride;

    let ax: XinputAxis = {
        xinputAxis: axis,
        axisAssignment: new Assignment(`${name}AxisXinput`, {
            name: `${name} Axis`,
            // trigger default to 0, 
            volume: isTrigger ? 0 : 0.5,
            assigned: false,
        })
    }

    // non-triggers need to go -1 to 1
    if (isTrigger == false) {
        ax.axisAssignment.on("volumeChanged", (level: number) => {
            //convert level from 0-1 to -1 to 1
            let val = (level * 2) - 1;
            ax.xinputAxis.setValue(val);
            ax.axisAssignment.volume = level;
        })
    
        ax.axisAssignment.on("assignPressed", () => {
            // reset to centre
            ax.axisAssignment.volume = 0.5;
            ax.xinputAxis.reset();
        })
    }
    else {
        ax.axisAssignment.on("volumeChanged", (level: number) => {
            //convert level from 0-1 to -1 to 1
            ax.xinputAxis.setValue(level);
            ax.axisAssignment.volume = level;
        })
    
        ax.axisAssignment.on("assignPressed", () => {
            // reset to centre
            ax.axisAssignment.volume = 0;
            ax.xinputAxis.reset();
        })
    }

    assignments.push(ax);
}

// Dpad is an axis but we can treat it like buttons
function createDpadInput(axis: InputAxis<X360Controller>, posName: string, negName: string ) {

    let butt: XinputDpad = {
        xinputAxis: axis,
        pushPosButton: new ButtonType(`Push${posName}ButtonXinput`, {
            name: `${posName} Dpad press`,
            active: true,
        }),
        releasePosButton: new ButtonType(`Release${posName}ButtonXinput`, {
            name: `${posName} Dpad release`,
            active: true,
        }),
        tapPosButton: new ButtonType(`Tap${posName}ButtonXinput`, {
            name: `${posName} Dpad tap`,
            active: true,
        }),
        pushNegButton: new ButtonType(`Push${negName}ButtonXinput`, {
            name: `${negName} Dpad press`,
            active: true,
        }),
        releaseNegButton: new ButtonType(`Release${negName}ButtonXinput`, {
            name: `${negName} Dpad release`,
            active: true,
        }),
        tapNegButton: new ButtonType(`Tap${negName}ButtonXinput`, {
            name: `${negName} Dpad tap`,
            active: true,
        }),
        posPushed: false,
        negPushed: false
    }

    // TODO: Less code duplication

    butt.pushPosButton.on("pressed", () => {
        butt.xinputAxis.setValue(1);
        butt.posPushed = true;
    })

    butt.releasePosButton.on("pressed", () => {
        if (butt.negPushed) {
            butt.xinputAxis.setValue(-1);
        }
        else {
            butt.xinputAxis.reset();
        }
        butt.posPushed = false;
    })

    butt.tapPosButton.on("pressed", () => {
        butt.xinputAxis.setValue(1);
        butt.posPushed = true;
        if (butt.negPushed) {
            butt.xinputAxis.setValue(-1);
        }
        else {
            butt.xinputAxis.reset();
        }
        butt.posPushed = false;
    })

    butt.pushNegButton.on("pressed", () => {
        butt.xinputAxis.setValue(-1);
        butt.negPushed = true;
    })

    butt.releaseNegButton.on("pressed", () => {
        if (butt.posPushed) {
            butt.xinputAxis.setValue(1);
        }
        else {
            butt.xinputAxis.reset();
        }
        butt.negPushed = false;
    })

    butt.tapNegButton.on("pressed", () => {
        butt.xinputAxis.setValue(-1);
        butt.negPushed = true;
        if (butt.posPushed) {
            butt.xinputAxis.setValue(1);
        }
        else {
            butt.xinputAxis.reset();
        }
        butt.negPushed = false;
    })

    dpads.push(butt);
}