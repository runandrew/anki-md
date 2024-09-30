import log from "./logger";

export interface Note {
  id?: number;
  modelName: "Basic";
  front: string;
  back: string;
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

export async function createNote(note: Note, deck: string): Promise<number> {
  log.info(`Anki Connect: Creating note ${note.front} in deck ${deck}`);
  return await ankiConnect("addNote", {
    note: {
      deckName: deck,
      modelName: note.modelName,
      fields: {
        Front: note.front,
        Back: note.back,
      },
      options: {
        allowDuplicate: false,
        duplicateScope: "deck",
      },
    },
  });
}

export async function updateNote(note: Note, deck: string): Promise<void> {
  log.info(`Anki Connect: Updating note ${note.id} in deck ${deck}`);
  await ankiConnect("updateNote", {
    note: {
      id: note.id,
      fields: {
        Front: note.front,
        Back: note.back,
      },
      deckName: deck,
    },
  });
}

export async function findNote(noteId: number): Promise<Note | null> {
  log.info(`Anki Connect: Finding note with ID ${noteId}`);
  const result = await ankiConnect("notesInfo", { notes: [noteId] });
  if (result && result.length > 0) {
    const noteInfo = result[0];
    return {
      id: noteInfo.noteId,
      modelName: noteInfo.modelName,
      front: noteInfo.fields.Front.value,
      back: noteInfo.fields.Back.value,
    };
  }
  return null;
}

export async function findNoteByFront(front: string): Promise<Note | null> {
  log.info(`Anki Connect: Finding note with front: ${front}`);
  const noteIds = await ankiConnect("findNotes", { query: `front:"${front}"` });
  if (noteIds && noteIds.length > 0) {
    return await findNote(noteIds[0]);
  }
  return null;
}
