import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";

const OBSIDIAN_PATH = "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes/What makes a pragmatic programmer?.md";

async function main () {

    // const md = await source.parseMd("./input/Hello World ABC.md");
    const { content, deck, name } = await source.parseMd(OBSIDIAN_PATH);
    const htmlContent = await marked(content);

    const fields: anki.BasicNoteFields = {
        Front: name,
        Back: htmlContent
    }

    const existingNote = await anki.findNoteByFront(fields.Front, deck);
    if (existingNote) {
        await anki.updateNote(existingNote.id, fields, deck);
        log.info(`Updated existing note: ${fields.Front}`);
    } else {
        await anki.createNote("Basic", fields, deck);
        log.info(`Created new note: ${fields.Front}`);
    }
}

main().catch(e => log.error(e));