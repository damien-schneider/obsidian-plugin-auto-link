import * as fs from "fs/promises";

export async function addDoubleBrackets(
	keywords: string[],
	filePaths: string[]
): Promise<{ result: boolean; numberOfAddedLinks: number }> {
	let numberOfAddedLinks = 0;
	for (const filePath of filePaths) {
		let content = await fs.readFile(filePath, "utf-8");

		for (const keyword of keywords) {
			// This regex ensures that the keyword is matched as a whole word and not inside brackets
			const regex = new RegExp(
				`(?<![\\w\\]])(${keyword})(?![\\w\\[]|\\]\\])`,
				"gi"
			);
			content = content.replace(regex, (match) => {
				numberOfAddedLinks += 1;
				return `[[${match}]]`;
			});
		}

		// Write the updated content back to the file
		await fs.writeFile(filePath, content, "utf-8");
	}
	return { result: true, numberOfAddedLinks };
}
