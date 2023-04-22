import * as fs from "fs/promises";
import { removeStopwords, eng, fra } from "stopword";

async function getWordsFromFile(path: string): Promise<string[]> {
	const content = await fs.readFile(path, "utf-8");
	const words = content
		.replace(/[^a-zA-Z\s]/g, "")
		.toLowerCase()
		.split(/\s+/);
	const filteredWords = removeStopwords(words, [...eng, ...fra]);
	return filteredWords;
}

export async function extractKeywords(files: string[]): Promise<string[]> {
	const commonWords: string[] = [];
	const wordCounts: { [word: string]: number } = {};

	for (const file of files) {
		const words = await getWordsFromFile(file);

		for (const word of words) {
			if (wordCounts[word]) {
				wordCounts[word]++;
			} else {
				wordCounts[word] = 1;
			}
		}
	}

	for (const word in wordCounts) {
		if (wordCounts[word] > 1 && !commonWords.includes(word)) {
			commonWords.push(word);
		}
	}

	return commonWords;
}
