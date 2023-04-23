// keywordsExtractor.ts
import * as fs from "fs";
import * as util from "util";

const readFile = util.promisify(fs.readFile);

export async function extractKeywords(filePath: string): Promise<string[]> {
	try {
		console.log("Voici le chemin essayé", filePath);
		const fileContent = await readFile(filePath, "utf-8");
		const keywords = getKeywordsFromMarkdown(fileContent);
		return keywords;
	} catch (error) {
		console.log("Voici le chemin d'erreur", filePath);
		console.error(`Error reading file: ${error.message}`);
		return [];
	}
}

function getKeywordsFromMarkdown(markdown: string): string[] {
	const regex = /(?:^|\s)(#[a-zA-Z0-9-]+)/g;
	const keywords = new Set<string>();
	let match;

	while ((match = regex.exec(markdown)) !== null) {
		keywords.add(match[1].substring(1));
	}

	return Array.from(keywords);
}
