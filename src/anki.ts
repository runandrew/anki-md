import http from "http";
import log from "./logger";

export interface Note {
  id?: number;
  modelName: "Basic";
  front: string;
  back: string;
}

interface AnkiCreateNoteResponse {
  result: number;
  error: string | null;
}

// todo: use a different input than Note
export async function createNote(note: Note, deck: string): Promise<number> {
  log.info(`Anki Connect: Creating note ${note.front} in deck ${deck}`);
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      action: "addNote",
      version: 6,
      params: {
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
      },
    });

    const options = {
      hostname: "localhost",
      port: 8765,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const response: AnkiCreateNoteResponse = JSON.parse(responseData);
          if (response.error) {
            log.error(`Anki Connect: Error creating note: ${response.error}`);
            reject(response.error);
          } else {
            resolve(response.result);
          }
        } catch (error) {
          log.error(`Anki Connect: Error parsing response: ${error}`);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      log.error(`Anki Connect: Error creating note: ${error}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

export async function updateNote(note: Note, deck: string): Promise<void> {
  log.info(`Anki Connect: Updating note ${note.id} in deck ${deck}`);
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      action: "updateNote",
      version: 6,
      params: {
        note: {
          id: note.id,
          fields: {
            Front: note.front,
            Back: note.back,
          },
          deckName: deck,
        }
      }
    });

    const options = {
      hostname: "localhost",
      port: 8765,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            log.error(`Anki Connect: Error updating note: ${response.error}`);
            reject(new Error(response.error));
          } else {
            resolve();
          }
        } catch (error) {
          log.error(`Anki Connect: Error parsing response: ${error}`);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      log.error(`Anki Connect: Error updating note: ${error}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

export async function findNote(noteId: number): Promise<Note | null> {
  log.info(`Anki Connect: Finding note with ID ${noteId}`);
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      action: "notesInfo",
      version: 6,
      params: {
        notes: [noteId]
      }
    });

    const options = {
      hostname: "localhost",
      port: 8765,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            log.error(`Anki Connect: Error finding note: ${response.error}`);
            reject(new Error(response.error));
          } else if (response.result && response.result.length > 0) {
            const noteInfo = response.result[0];
            const note: Note = {
              id: noteInfo.noteId,
              modelName: noteInfo.modelName,
              front: noteInfo.fields.Front.value,
              back: noteInfo.fields.Back.value,
              // Add any other fields you need from the noteInfo
            };
            resolve(note);
          } else {
            resolve(null); // Note not found
          }
        } catch (error) {
          log.error(`Anki Connect: Error parsing response: ${error}`);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      log.error(`Anki Connect: Error finding note: ${error}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

export async function findNoteByFront(front: string): Promise<Note | null> {
    log.info(`Anki Connect: Finding note with front: ${front}`);
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        action: "findNotes",
        version: 6,
        params: {
          query: `front:"${front}"`
        }
      });
  
      const options = {
        hostname: "localhost",
        port: 8765,
        path: "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
      };
  
      const req = http.request(options, (res) => {
        let responseData = "";
  
        res.on("data", (chunk) => {
          responseData += chunk;
        });
  
        res.on("end", () => {
          try {
            const response = JSON.parse(responseData);
            if (response.error) {
              log.error(`Anki Connect: Error finding note: ${response.error}`);
              reject(new Error(response.error));
            } else if (response.result && response.result.length > 0) {
              // Get the first matching note ID
              const noteId = response.result[0];
              // Fetch the note details
              findNote(noteId).then(resolve).catch(reject);
            } else {
              resolve(null); // Note not found
            }
          } catch (error) {
            log.error(`Anki Connect: Error parsing response: ${error}`);
            reject(error);
          }
        });
      });
  
      req.on("error", (error) => {
        log.error(`Anki Connect: Error finding note: ${error}`);
        reject(error);
      });
  
      req.write(data);
      req.end();
    });
  }
  