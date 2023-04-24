import * as fs from "fs/promises";
import { removeStopwords, eng, fra } from "stopword";
import { Notice } from "obsidian";

// Read files and return an array of filtered words
async function getWordsFromFile(filePath: string): Promise<string[]> {
	const content = await fs.readFile(filePath, "utf-8");
	const words = content
		.replace(/[^a-zA-Z\s]/g, "")
		.toLowerCase()
		.split(/\s+/);
	const filteredWords = removeStopwords(words, [...eng, ...fra]);
	return filteredWords;
}
// Extract keywords from files of every files
// Return an object with the keywords and their count and the filepaths of the files where the words are found
export async function extractKeywords(
	filePaths: string[]
): Promise<{ [word: string]: { count: number; paths: string[] } }> {
	new Notice("Start finding keywords");
	const fileWordCounts: { [file: string]: { [word: string]: number } } = {};

	//For each file, get the words and count occurences
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

	const keywords: { [word: string]: { count: number; paths: string[] } } = {};
	// For each word in each file, add the word to the keywords object, or increment the count if the word already exists and add the path to the paths array
	for (const file in fileWordCounts) {
		for (const word in fileWordCounts[file]) {
			if (keywords[word]) {
				keywords[word].count += fileWordCounts[file][word];
				if (!keywords[word].paths.includes(file)) {
					keywords[word].paths.push(file);
				}
			} else {
				keywords[word] = {
					count: fileWordCounts[file][word],
					paths: [file],
				};
			}
		}
	}
	//Remove the first element of keywords if it's an empty strings
	if (keywords[""]) {
		delete keywords[""];
	}
	console.log(keywords);
	return keywords;
}
