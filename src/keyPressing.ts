import ffi from "ffi-napi";
import ref from "ref-napi";
import os from "os";
import import_Struct from "ref-struct-di";
import StructType from "ref-struct-di";
import ArrayType from 'ref-array-napi';
import keycode from 'keycode';

var arch = os.arch();
const Struct = import_Struct(ref);

var Input = Struct({
    "type": "int",

    // For some reason, the wScan value is only recognized as the wScan value when we add this filler slot.
    // It might be because it's expecting the values after this to be inside a "wrapper" substructure, as seen here:
    //     https://msdn.microsoft.com/en-us/library/windows/desktop/ms646270(v=vs.85).aspx
    "???": "int",

    "wVK": "short",
    "wScan": "short",
    "dwFlags": "int",
    "time": "int",
    "dwExtraInfo": "int"
});

let aInput = ArrayType(Input);

var user32 = ffi.Library("user32", {
    SendInput: ["int", ["int", Input, "int"]],
    MapVirtualKeyExA: ["uint", ["uint", "uint", "int"]],
});


const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_UNICODE = 0x0004;
const KEYEVENTF_SCANCODE = 0x0008;
//const MAPVK_VK_TO_VSC = 0;

export class KeyToggle_Options {
    asScanCode = true;
    keyCodeIsScanCode = false;
    flags?: number;
    async = false; // async can reduce stutter in your app, if frequently sending key-events
}

let entry = new Input(); // having one persistent native object, and just changing its fields, is apparently faster (from testing)
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;
export function KeyToggle(keyCode: number, type = "down" as "down" | "up", options?: Partial<KeyToggle_Options>, modifiers: number[] = []) {
    const opt = Object.assign({}, new KeyToggle_Options(), options);

    // scan-code approach (default)
    if (opt.asScanCode) {
        let scanCode = opt.keyCodeIsScanCode ? keyCode : ConvertKeyCodeToScanCode(keyCode);
        // let isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;
        let isExtended = isExtendedKey(keyCode);

        entry.dwFlags = KEYEVENTF_SCANCODE;
        if (isExtended) {
            entry.dwFlags |= KEYEVENTF_EXTENDEDKEY;
        }

        entry.wVK = 0;
        // entry.wScan = isExtended ? scanCode - extendedKeyPrefix : scanCode;
        entry.wScan = scanCode;
    }
    // (virtual) key-code approach
    else {
        entry.dwFlags = 0;
        entry.wVK = keyCode;
        entry.wScan = 0;
    }

    if (opt.flags != null) {
        entry.dwFlags = opt.flags;
    }
    if (type == "up") {
        entry.dwFlags |= KEYEVENTF_KEYUP;
    }

    if (opt.async) {
        return new Promise((resolve, reject) => {
            user32.SendInput.async(1, entry, arch === "x64" ? 40 : 28, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
    return user32.SendInput(1, entry, arch === "x64" ? 40 : 28);
}

function ConvertKeyCodeToScanCode(keyCode: number) {
    return user32.MapVirtualKeyExA(keyCode, 0, 0);
}

const EXTENDED_KEYS = [keycode.codes.up, keycode.codes.down, keycode.codes.left, keycode.codes.right, keycode.codes.home, keycode.codes.end, keycode.codes.insert, keycode.codes.delete, keycode.codes["page up"], keycode.codes["page down"]]

function isExtendedKey(keycode: number) {
    return EXTENDED_KEYS.includes(keycode);
}
