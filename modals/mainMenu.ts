import { App, Modal, Setting, Notice, DataAdapter } from "obsidian";
import { extractKeywords } from "../functions/extractKeywords.js";
import * as path from "path";
export class MainModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
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

	onOpen() {
		const { contentEl } = this;
		const files = this.app.vault.getMarkdownFiles();

		for (let i = 0; i < files.length; i++) {
			console.log(files[i].path);
		}

		contentEl.createEl("h1", { text: "Auto Link" });

		new Setting(contentEl).addButton((btn: any) =>
			btn
				.setButtonText("Display all vault file size")
				.setCta()
				.onClick(async () => {
					const fileLength = await this.averageFileLength();
					new Notice(`The average file size : ${fileLength}!`);
				})
		);

		new Setting(contentEl).addButton((btn: any) =>
			btn
				.setButtonText("Display keyword list")
				.setCta()
				.onClick(async () => {
					const files = this.app.vault.getMarkdownFiles();
					console.log(files);
					const vaultPath = (this.app.vault.adapter as any).basePath;
					console.log(vaultPath);
					let filePath = [];
					for (let i = 0; i < files.length; i++) {
						filePath[i] = path.resolve(vaultPath, files[i].path);
					}
					const keywords = await extractKeywords(filePath);
					for (let i = 0; i < keywords.length; i++) {
						console.log(keywords[i]);
					}
					new Notice(`Here are the keywords: ${keywords}!`);
				})
		);

		new Setting(contentEl).setName("Name").addText((text: any) =>
			text.onChange((value: any) => {
				this.result = value;
			})
		);

		const checkboxWrapper = contentEl.createDiv({
			cls: "checkbox-wrapper",
		});
		new Setting(checkboxWrapper)
			.setName("Option 1")
			.addToggle((toggle: any) => {
				toggle.onChange((value: boolean) => {
					// Handle the checkbox value change here
				});
			});

		new Setting(checkboxWrapper)
			.setName("Option 2")
			.addToggle((toggle: any) => {
				toggle.onChange((value: boolean) => {
					// Handle the checkbox value change here
				});
			});
		// Wrap the button in a div element
		const buttonWrapper = contentEl.createEl("div", {
			attr: { style: "display: flex; justify-content: center;" },
		});

		new Setting(buttonWrapper).addButton((btn: any) =>
			btn
				.setButtonText("Start Vault Analysis")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.result);
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
