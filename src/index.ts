import { initButtons, removeButtons } from "./buttons";
import { initMouse } from "./mouse";
import { initWheels } from "./wheels";
import { initXinput } from "./xinput";


// calling .remove() on the button doesn't seem to actually remove it from the list
$MM.onSettingsButtonPress("updateSettings", () => {
    removeButtons();
    init();
});

async function init() {
    console.log("initialized");
    let settings: Record<string, any> = await $MM.getSettings();
    let codeList: string = settings["keycode"];
    let wheelList: string = settings["wheelkeycodes"];
    let XinputEnable: boolean = settings["XinputEnable"]
    let mouseInputEnable: boolean = settings["mouseInputEnable"];
    let mouseInputRelative: boolean = settings["mouseInputRelative"];

    console.log(`codelist is: ${codeList}`);
    initButtons(codeList);
    initWheels(wheelList);
    if (XinputEnable) {
        initXinput();
    }
    if (mouseInputEnable) {
        initMouse(mouseInputRelative);
    }
}

init();
