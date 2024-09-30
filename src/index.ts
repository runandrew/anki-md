import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";
import isEqual from "lodash/isEqual";

const OBSIDIAN_PATH =
  "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes/What makes a pragmatic programmer?.md";

async function upsertNote(fields: anki.BasicNoteFields, deck: string): Promise<void> {
  log.info(`Upserting note: "${fields.Front}"`);
  const existingNote = await anki.findNoteByQuery({ front: fields.Front, deck, note: "Basic" });
  if (existingNote) {
    if (isEqual(existingNote.fields, fields)) {
      log.info(`Note "${fields.Front}" has not changed`);
      return;
    }
    await anki.updateNote(existingNote.id, fields, deck);
    log.info(`Updated existing note: "${fields.Front}"`);
  } else {
    await anki.createNote(fields, deck);
    log.info(`Created new note: "${fields.Front}"`);
  }
}

async function main() {
  const { content, deck, name } = await source.parseMd(OBSIDIAN_PATH);
  const htmlContent = await marked(content);

  const fields: anki.BasicNoteFields = {
    Front: name,
    Back: htmlContent,
  };

  await upsertNote(fields, deck);
}

main().catch((e) => log.error(e));
