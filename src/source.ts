import assert from "assert";
import fs from "fs";
import matter from "gray-matter";

interface Md {
  name: string;
  deck: string;
  content: string;
}

async function parseMd(path: string): Promise<Md> {
  const fileContents = await fs.promises.readFile(path, "utf-8");
  const { data, content } = matter(fileContents);

  const name = path.split("/").pop()?.replace(/\.md$/, "") || "";

  assert(typeof data["anki-deck"] === "string", "anki-deck file property is not defined");
  assert(data["anki-deck"] !== "", "anki-deck file property is empty");

  const deck = data["anki-deck"];

  return {
    name,
    deck,
    content,
  };
}

async function isValidMdFile(path: string): Promise<boolean> {
  if (!path.endsWith(".md")) {
    return false;
  }

  const fileContents = await fs.promises.readFile(path, "utf-8");
  const { data } = matter(fileContents);
  return typeof data["anki-deck"] === "string" && data["anki-deck"] !== "";
}

async function isDir(path: string): Promise<boolean> {
  const stats = await fs.promises.stat(path);
  return stats.isDirectory();
}

export async function parseMdDir(path: string, recursive: boolean = true): Promise<Md[]> {
  const files = await fs.promises.readdir(path);

  const out: Md[] = [];

  for (const file of files) {
    if (await isDir(`${path}/${file}`)) {
      if (recursive) {
        out.push(...(await parseMdDir(`${path}/${file}`)));
      }
    } else if (await isValidMdFile(`${path}/${file}`)) {
      out.push(await parseMd(`${path}/${file}`));
    }
  }

  return out;
}
