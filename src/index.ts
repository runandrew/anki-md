import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";

const OBSIDIAN_PATH = "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes/What makes a pragmatic programmer?.md";

async function main () {

    // const md = await source.parseMd("./input/Hello World ABC.md");
    const { content, deck, name } = await source.parseMd(OBSIDIAN_PATH);
    const htmlContent = await marked(content);

    const note: anki.Note = {
        modelName: "Basic",
        front: name,
        back: htmlContent
    }

    const existingNote = await anki.findNoteByFront(note.front, deck);
    if (existingNote) {
        await anki.updateNote({ id: existingNote.id, ...note}, deck);
        log.info(`Updated existing note: ${note.front}`);
    } else {
        await anki.createNote(note, deck);
        log.info(`Created new note: ${note.front}`);
    }
}

main().catch(e => log.error(e));