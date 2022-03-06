import { KeyToggle, KeyToggle_Options } from "./keyPressing";

export interface KeyButton {
    codes: Code[],
    name: string,
    multiplier: number,
}

export interface Code {
    code: number,
    asScanCode: boolean
}

export function parseKeycode(entry: string): KeyButton | null {
    // formats
    // `17+~70` - control + f, f is scan code
    // `124(f13)` - key code 124, name is `f13`

    let asScanCode = /^~/.test(entry);

    // This will find only numbers not followed by a `)` or preceded by a *
    let groups = entry.match(/(?<!\*)(~?[0-9]+)(?![\w\s]*[\)\]])/g);

    if (!groups || groups.length == 0) {
        console.log(`Could not find valid keys to press in entry: ${entry}`);
        log.error(`Could not find valid keys to press in entry: ${entry}`);
        return null;
    }

    let name = nameSearch(entry);

    let codes = groups.map((s): Code => {
        let asScanCode = /^~/.test(s);
        if (asScanCode) {
            s = s.replace("~", "");
        }
        return {
            asScanCode,
            code: Number(s)
        }
    });

    let multiplierGroups = entry.match(/(?<=\*)([0-9]+)(?![\w\s]*[\)\]])/);
    let multiplier = 1;

    if (multiplierGroups && multiplierGroups.length > 0) {
        multiplier = Number(multiplierGroups[1]);
    }

    return {
        name,
        codes,
        multiplier
    }
}

export function parseWheelCode(entry: string) {
    // formats
    // `~37/~39` - scan codes, left and right
    // `37(left)[17+37(shift left)]/39(right)[17+39(shift right)]` - left and right, alt mode of shift+left and shift+right. Names are left, shift left, right, and shift right
    // `37[37*3]/39[39*3]` - left and right, alt mode of left 3 times and right 3 times

    // split on `/`
    // [`37(left)[16+37(shift left)]`, `39(right)[16+37(shift right)]`]

    let splitCodes = entry.split('/');

    if (splitCodes.length !== 2) {
        console.log("Invalid wheel entry: ", entry)
        log.error("Invalid wheel entry: ", entry)
        return null;
    }

    let subCodes: string[] = [];
    // split out the alt modes
    // [`37(left)`, `16+37(shift left)`, `39(right)`, `16+37(shift right)`]
    for (let fullCode of splitCodes) {
        let { code, alt } = splitWheelCode(fullCode);
        subCodes.push(code, alt);
    }

    // parse keycode for each one
    let subEntries: KeyButton[] = [];
    for (let code of subCodes) {
        let kb = parseKeycode(code);
        if (kb) {
            subEntries.push(kb);
        }
        else {
            console.log("Failed to parse", code);
            log.error("Failed to parse", code);

            console.log("Cancelling creating wheel for", entry);
            log.error("Cancelling creating wheel for", entry);
            return null;
        }
    }

    return subEntries;
}

function nameSearch(entry: string): string {
    let nameSearch = entry.match(/\((.+)\)/);
    let name: string = entry;

    if (!nameSearch || nameSearch.length == 0) {
        // console.log("no name specified");
    }
    else {
        name = nameSearch[1];
    }

    return name;
}

function splitWheelCode(entry: string) {
    let altCodeGroups = entry.match(/\[(.+)\]/);

    if (altCodeGroups && altCodeGroups.length > 0) {
        let code = entry.replace(altCodeGroups[0], "");
        return {
            code,
            alt: altCodeGroups[1]
        };
    }

    return {
        code: entry,
        alt: entry,
    }
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

export function KeysDown(codes: Code[]) {
    for (let code of codes) {
        KeyDown(code.code, { asScanCode: code.asScanCode });
    }
}

export function KeysUp(codes: Code[]) {
    for (let code of codes) {
        KeyUp(code.code, { asScanCode: code.asScanCode });
    }
}

export function KeysTap(codes: Code[]) {
    // Press and release codes in inverse order
    KeysDown(codes);
    KeysUp([...codes].reverse());
}
