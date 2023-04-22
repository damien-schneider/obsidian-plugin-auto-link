import { Notice, Plugin } from "obsidian";

export default class ExamplePlugin extends Plugin {
	async onload() {
		this.addRibbonIcon(
			"info",
			"Calculate average file length",
			async () => {
				const fileLength = await this.averageFileLength();
				new Notice(
					`The average file length is ${fileLength} characters.`
				);
			}
		);
	}

	async averageFileLength(): Promise<number> {
		const { vault } = this.app;

		const fileContents: string[] = await Promise.all(
			vault.getMarkdownFiles().map((file) => vault.cachedRead(file))
		);

		let totalLength = 0;
		fileContents.forEach((content) => {
			totalLength += content.length;
		});

		return totalLength / fileContents.length;
	}
}
