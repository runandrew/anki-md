import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";
import isEqual from "lodash/isEqual";

const OBSIDIAN_PATH =
  "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes";

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
  const mds = await source.parseMdDir(OBSIDIAN_PATH);

  for (const md of mds) {
    const htmlContent = await marked(md.content);

    const fields: anki.BasicNoteFields = {
      Front: md.name,
      Back: htmlContent,
    };

    await upsertNote(fields, md.deck);
  }
}

main().catch((e) => log.error(e));
