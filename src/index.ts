import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";
import isEqual from "lodash/isEqual";

const OBSIDIAN_PATH =
  "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes/What makes a pragmatic programmer?.md";

async function main() {
  // const md = await source.parseMd("./input/Hello World ABC.md");
  const { content, deck, name } = await source.parseMd(OBSIDIAN_PATH);
  const htmlContent = await marked(content);

  const fields: anki.BasicNoteFields = {
    Front: name,
    Back: htmlContent,
  };

  const existingNote = await anki.findNoteByQuery({ front: fields.Front, deck });
  if (existingNote) {
    if (isEqual(existingNote.fields, fields)) {
      log.info(`Note "${fields.Front}" has not changed`);
      return;
    }
    await anki.updateNote(existingNote.id, fields, deck);
    log.info(`Updated existing note: "${fields.Front}"`);
  } else {
    await anki.createNote("Basic", fields, deck);
    log.info(`Created new note: "${fields.Front}"`);
  }
}

main().catch((e) => log.error(e));
