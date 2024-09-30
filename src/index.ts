import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main () {
    const md = await source.parseMd("./input/Hello World ABC.md");
    const htmlContent = await marked(md.content);

    const note: anki.Note = {
        modelName: "Basic",
        front: md.name,
        back: htmlContent
    }

    const existingNote = await anki.findNoteByFront(note.front);
    if (existingNote) {
        await anki.updateNote({ id: existingNote.id, ...note}, "Test");
        log.info(`Updated existing note: ${note.front}`);
    } else {
        await anki.createNote(note, "Test");
        log.info(`Created new note: ${note.front}`);
    }
}

main().catch(e => log.error(e));