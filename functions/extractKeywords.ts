import * as fs from "fs/promises";
import { removeStopwords, eng, fra } from "stopword";
import { Notice } from "obsidian";

async function getWordsFromFile(path: string): Promise<string[]> {
	const content = await fs.readFile(path, "utf-8");
	const words = content
		.replace(/[^a-zA-Z\s]/g, "")
		.toLowerCase()
		.split(/\s+/);
	const filteredWords = removeStopwords(words, [...eng, ...fra]);
	return filteredWords;
}

export async function extractKeywords(filePaths: string[]): Promise<string[]> {
	new Notice("Start finding keywords");
	const commonWords: string[] = [];
	const fileWordCounts: { [file: string]: { [word: string]: number } } = {};

	for (const filePath of filePaths) {
		const words = await getWordsFromFile(filePath);
		fileWordCounts[filePath] = {};

		for (const word of words) {
			if (fileWordCounts[filePath][word]) {
				fileWordCounts[filePath][word]++;
			} else {
				fileWordCounts[filePath][word] = 1;
			}
		}
	}

	const wordCounts: { [word: string]: number } = {};
	for (const file in fileWordCounts) {
		for (const word in fileWordCounts[file]) {
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
	console.log(commonWords);
	return commonWords;
}
