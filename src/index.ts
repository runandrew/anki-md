import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";

async function main () {
    const md = await source.parseMd("./input/Hello World ABC.md");
    const htmlContent = await marked(md.content);

    const note: anki.Note = {
        modelName: "Basic",
        front: md.name,
        back: htmlContent
    }

    await anki.createNote(note, "Test");
}

main().catch(e => log.error(e));