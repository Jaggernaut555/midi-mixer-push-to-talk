import { initButtons, removeButtons } from "./buttons";
import { initWheels } from "./wheels";


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

    console.log(`codelist is: ${codeList}`);
    initButtons(codeList);
    initWheels(wheelList);
}

init();
