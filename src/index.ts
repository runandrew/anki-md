import * as anki from "./anki";

const note: anki.Note = {
    modelName: "Basic",
    front: "hello",
    back: "world"
}

async function main () {
    await anki.createNote(note, "Test");
}

main().catch(console.error);