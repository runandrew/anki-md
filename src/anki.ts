// This file interacts with AnkiConnect
import http from "http";

export interface Note {
  modelName: "Basic";
  front: String;
  back: String;
}

interface AnkiCreateNoteResponse {
  result: number;
  error: string | null;
}

export async function createNote(note: Note, deck: string): Promise<number> {
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
            console.error("Error creating note:", response.error);
            reject(response.error);
          } else {
            resolve(response.result);
          }
        } catch (error) {
          console.error("Error parsing response:", error);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error creating note:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}
