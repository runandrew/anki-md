import fs from 'fs';
import matter from 'gray-matter';

interface Md {
    name: string;
    deck: string;
    content: string;
}

export async function parseMd(path: string): Promise<Md> {
    // Read the file contents
    const fileContents = await fs.promises.readFile(path, 'utf-8');
    
    // Parse the file using gray-matter
    const { data, content } = matter(fileContents);

    // Extract the filename without extension
    const name = path.split('/').pop()?.replace(/\.md$/, '') || '';

    if (typeof data["anki-deck"] !== "string") throw Error("anki-deck file property is not defined");

    const deck = data["anki-deck"];
    
    return {
        name,
        deck,
        content,
    };
}