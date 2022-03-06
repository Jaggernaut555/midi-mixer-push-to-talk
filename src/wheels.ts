import { Assignment } from "midi-mixer-plugin";
import { KeyButton, KeysTap, parseWheelCode } from "./utils";

export function initWheels(codeList: string) {
    let codes = codeList.split(',');

    for (let code of codes) {
        let wheelData = parseWheelCode(code);

        if (!wheelData || wheelData.length != 4) {
            // right now logging is done in the code parsing
            continue;
        }

        let name = `${wheelData[0].name}/${wheelData[2].name} (${wheelData[1].name}/${wheelData[3].name})`;

        let wheelAssignment = new Assignment(`Wheel${name}`, {
            name: `Wheel ${name}`,
            volume: 0.5,
            assigned: false,
        });

        wheelAssignment.on("volumeChanged", (level: number) => {
            let kb: KeyButton;
            if (!wheelData) {
                console.log(`Unepected error on ${wheelAssignment.name}`);
                log.error(`Unepected error on ${wheelAssignment.name}`);
                return;
            }
            if (level < 0.5) {
                if (wheelAssignment.assigned) {
                    kb = wheelData[1];
                }
                else {
                    kb = wheelData[0];
                }
            }
            else {
                if (wheelAssignment.assigned) {
                    kb = wheelData[3];
                }
                else {
                    kb = wheelData[2];
                }
            }
            let speed = kb.multiplier;

            // Some infinite rotaries adjust higher values based on how fast you turn them
            // Is it desirable to have this run speed * diff times?
            // let diff = Math.abs(Math.ceil(level * 100 - 50));
            // console.log("Changing volume by", diff);

            for (let i = 0; i < speed; i++) {
                KeysTap(kb.codes)
            }
        })

        wheelAssignment.on("assignPressed", () => {
            wheelAssignment.assigned = !wheelAssignment.assigned
        })

    }
}
