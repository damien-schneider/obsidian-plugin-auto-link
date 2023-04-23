import { App, Modal, Setting, Notice, DataAdapter } from "obsidian";
import { extractKeywords } from "../functions/extractKeywords.js";
import * as path from "path";
import { addDoubleBrackets } from "../functions/addDoubleBrackets.js";
import { ResultModal } from "./resultModal.js";

export class MainModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		let { contentEl } = this;
		let { containerEl } = this;
		const vaultPath = (this.app.vault.adapter as any).basePath;
		let extractedKeywords: string[] = [];

		contentEl.createEl("h1", { text: "Auto Link" });

		new Setting(contentEl).addButton((btn: any) =>
			btn
				.setButtonText("Display keyword list")
				.setCta()
				.onClick(async () => {
					const files = this.app.vault.getMarkdownFiles();
					console.log(files);

					console.log(vaultPath);
					let filePath = [];
					for (let i = 0; i < files.length; i++) {
						filePath[i] = path.resolve(vaultPath, files[i].path);
					}
					const keywords = await extractKeywords(filePath);
					extractedKeywords = keywords;
					new Notice(`Here are the keywords: ${keywords}!`);
				})
		);

		// containerEl.createEl("h1", { text: "Heading 1" });
		const book = containerEl.createEl("div");
		book.createEl("div", { text: "How to Take Smart Notes" });
		book.createEl("small", { text: "Sönke Ahrens" });

		//Function which add <p></p> for each keywords found in the files
		function addPtag(contentEl: HTMLElement, keywords: string[]) {
			for (let i = 0; i < keywords.length; i++) {
				const p = contentEl.createEl("p", {
					text: `Keyword ${i} : ${keywords[i]}`,
				});
				contentEl.appendChild(p);
			}
		}
		new Setting(contentEl).addButton((btn: any) =>
			btn
				.setButtonText("Add new p tag")
				.setCta()
				.onClick(() => {
					// Create a new <p> element with content "Coucou"
					const p = contentEl.createEl("p", {
						text: "Coucou",
					});
					// Append the new <p> element to the modal's content
					contentEl.appendChild(p);
				})
		);

		new Setting(contentEl).addButton((btn: any) =>
			btn
				.setButtonText("Test")
				.setCta()
				.onClick(async () => {
					const files = ["file1.md", "file2.md", "file3.md"];
					const commonWords = await extractKeywords(files);
					await addDoubleBrackets(files, commonWords);
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
