import * as fs from "fs-extra";

//TODO : Check if the word doesn't already have double brackets

export async function addDoubleBrackets(
	files: string[],
	words: string[]
): Promise<void> {
	const wordSet = new Set(words);
	const regexWords = words.map((word) => `\\b${word}\\b`).join("|");
	const regex = new RegExp(regexWords, "gi");

	for (const file of files) {
		const content = await fs.readFile(file, "utf-8");
		const updatedContent = content.replace(regex, (match: any) => {
			if (wordSet.has(match.toLowerCase())) {
				return `[[${match}]]`;
			}
			return match;
		});

		if (content !== updatedContent) {
			await fs.writeFile(file, updatedContent, "utf-8");
		}
	}
}
