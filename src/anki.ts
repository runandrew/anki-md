import log from "./logger";

export type Note = BasicNote;

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

export async function createNote(modelName: string, fields: BasicNoteFields, deck: string): Promise<number> {
  log.info(`Anki Connect: Creating note ${fields.Front} in deck ${deck}`);
  return await ankiConnect("addNote", {
    note: {
      deckName: deck,
      modelName: modelName,
      fields,
      options: {
        allowDuplicate: false,
        duplicateScope: "deck",
      },
    },
  });
}

export async function updateNote(id: number, fields: BasicNoteFields, deck: string): Promise<void> {
  log.info(`Anki Connect: Updating note ${id} in deck ${deck}`);
  await ankiConnect("updateNote", {
    note: {
      id: id,
      fields,
      deckName: deck,
    },
  });
}

export async function findNote(id: number): Promise<Note | null> {
  log.info(`Anki Connect: Finding note with ID ${id}`);
  const result = await ankiConnect("notesInfo", { notes: [id] });
  if (result && result.length > 0) {
    const noteInfo = result[0];
    return {
      id: noteInfo.noteId,
      modelName: noteInfo.modelName,
      fields: noteInfo.fields,
    };
  }
  return null;
}

export async function findNoteByFront(front: string, deck: string): Promise<Note | null> {
  log.info(`Anki Connect: Finding note with front: ${front} in deck: ${deck}`);
  const query = `deck:"${deck}" front:"${front}"`;
  const noteIds = await ankiConnect("findNotes", { query });
  if (noteIds && noteIds.length > 0) {
    return await findNote(noteIds[0]);
  }
  return null;
}
