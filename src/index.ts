import * as anki from "./anki";
import * as source from "./source";
import { marked } from "marked";
import log from "./logger";

const OBSIDIAN_PATH =
  "/Users/andrewgarcia/Library/Mobile Documents/iCloud~md~obsidian/Documents/Andrew/Notes";

async function main() {
  const mds = await source.parseMdDir(OBSIDIAN_PATH);

  for (const md of mds) {
    const htmlContent = await marked(md.content);

    const fields: anki.BasicNoteFields = {
      Front: md.name,
      Back: htmlContent,
    };

    await anki.upsertNote(fields, md.deck);
  }
}

main().catch((e) => log.error(e));
