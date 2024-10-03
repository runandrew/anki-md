import log from "./logger";
import isEqual from "lodash/isEqual";

export interface BasicNote {
  id: number;
  modelName: "Basic";
  fields: BasicNoteFields;
}

export interface BasicNoteFields {
  Front: string;
  Back: string;
}

// todo: don't use any as the return type
async function ankiConnect(action: string, params: any): Promise<any> {
  const response = await fetch("http://localhost:8765", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      version: 6,
      params,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Anki Connect: ${data.error}`);
  }
  return data.result;
}

export async function createNote(fields: BasicNoteFields, deck: string): Promise<number> {
  log.info(`Anki Connect: Creating note "${fields.Front}" in deck "${deck}"`);
  return await ankiConnect("addNote", {
    note: {
      deckName: deck,
      modelName: "Basic",
      fields,
      options: {
        allowDuplicate: false,
        duplicateScope: "deck",
      },
    },
  });
}

export async function updateNote(id: number, fields: BasicNoteFields, deck: string): Promise<void> {
  log.info(`Anki Connect: Updating note "${fields.Front}" in deck "${deck}"`);
  await ankiConnect("updateNote", {
    note: {
      id: id,
      fields,
      deckName: deck,
    },
  });
}

export async function upsertNote(fields: BasicNoteFields, deck: string): Promise<void> {
  log.info(`Upserting note: "${fields.Front}"`);
  const existingNote = await findNoteByQuery({ front: fields.Front, deck, note: "Basic" });
  if (existingNote) {
    if (isEqual(existingNote.fields, fields)) {
      log.info(`Note "${fields.Front}" has not changed`);
      return;
    }
    await updateNote(existingNote.id, fields, deck);
    log.info(`Updated existing note: "${fields.Front}"`);
  } else {
    await createNote(fields, deck);
    log.info(`Created new note: "${fields.Front}"`);
  }
}

export async function findNote(id: number): Promise<BasicNote | null> {
  log.info(`Anki Connect: Finding note with ID "${id}"`);
  const result = await ankiConnect("notesInfo", { notes: [id] });
  if (result && result.length > 0) {
    const noteInfo = result[0];
    // The fields object comes back as a map of { value: string; order: number }
    // We need to convert it back to a simple key-value pair, removing the order field
    const noteInfoFields: Record<string, { value: string; order: number }> = noteInfo.fields;
    const fields = Object.keys(noteInfoFields).reduce(
      (acc: Record<string, string>, key: string) => {
        acc[key] = noteInfoFields[key].value;
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      id: noteInfo.noteId,
      modelName: noteInfo.modelName,
      fields: fields as unknown as BasicNoteFields,
    };
  }
  return null;
}

export async function findNoteByQuery(query: Record<string, string>): Promise<BasicNote | null> {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}:"${value}"`)
    .join(" ");
  log.info(`Anki Connect: Finding note with query: ${queryString}`);
  const noteIds = await ankiConnect("findNotes", { query: queryString });
  if (noteIds && noteIds.length > 0) {
    return await findNote(noteIds[0]);
  }
  return null;
}
