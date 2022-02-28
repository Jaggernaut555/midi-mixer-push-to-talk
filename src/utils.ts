import { KeyToggle, KeyToggle_Options } from "./keyPressing";

export interface KeyButton {
    codes: number[],
    name: string,
    asScanCode: boolean,
}

export function parseKeycode(entry: string): KeyButton | null {
    // formats?
    // `~17+70` - scan code, control + f
    // `124(f13)` - key code 124, name the button f13

    let asScanCode = /^~/.test(entry);

    // ([0-9]+)(?![\w\s]*[\)])
    // This will find only numbers not followed by a `)`
    let groups = entry.match(/([0-9]+)(?![\w\s]*[\)])/g);
    
    if (!groups || groups.length == 0) {
        console.log(`Could not find valid keys to press in entry: ${entry}`);
        log.error(`Could not find valid keys to press in entry: ${entry}`);
        return null;
    }
    
    let nameSearch = entry.match(/\((.+)\)/);
    let name: string = entry;

    if (!nameSearch || nameSearch.length == 0) {
        console.log("no name specified");
    }
    else {
        name = nameSearch[1];
    }

    let codes = groups.map((s) => { return Number(s); });

    return {
        name,
        asScanCode,
        codes
    }
}

export function KeyTap(keyCode: number, opt?: Partial<KeyToggle_Options>, modifiers: number[] = []) {
    for (let m of modifiers) {
        KeyToggle(m, "down", { asScanCode: true });
    }
    KeyToggle(keyCode, "down", opt, modifiers);
    KeyToggle(keyCode, "up", opt, modifiers);
    for (let m of modifiers) {
        KeyToggle(m, "up", { asScanCode: true });
    }
}

export function KeyTapWithModifier(keyCode: number, modifiers: number[], opt?: Partial<KeyToggle_Options>) {
    KeyTap(keyCode, opt);
}

export function KeyDown(keyCode: number, opt?: Partial<KeyToggle_Options>, modifiers: number[] = []) {
    for (let m of modifiers) {
        KeyToggle(m, "down", { asScanCode: true });
    }
    KeyToggle(keyCode, "down", opt, modifiers);
}

export function KeyUp(keyCode: number, opt?: Partial<KeyToggle_Options>, modifiers: number[] = []) {
    KeyToggle(keyCode, "up", opt, modifiers);
    for (let m of modifiers) {
        KeyToggle(m, "up", { asScanCode: true });
    }
}

export function KeysDown(codes: number[], opt?: Partial<KeyToggle_Options>) {
    for(let code of codes) {
        KeyDown(code, opt);
    }
}

export function KeysUp(codes: number[], opt?: Partial<KeyToggle_Options>) {
    for(let code of codes) {
        KeyUp(code, opt);
    }
}

export function KeysTap(codes: number[], opt?: Partial<KeyToggle_Options>) {
    KeysDown(codes, opt);
    KeysUp(codes, opt);
}
