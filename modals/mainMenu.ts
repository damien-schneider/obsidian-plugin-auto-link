import { App, Modal, Setting, Notice, DataAdapter } from "obsidian";
import { extractKeywords } from "../functions/extractKeywords.js";
import * as path from "path";
import { addDoubleBrackets } from "../functions/addDoubleBrackets.js";

export class MainModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		let { contentEl } = this;

		const vaultPath = (this.app.vault.adapter as any).basePath;

		contentEl.createEl("h1", {
			text: "Auto Link",
			attr: { style: "text-align: center;" },
		});
		contentEl.createEl("br", {});
		contentEl.createEl("h2", { text: "Parameters :" });

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
					new Notice(`Here are the keywords: ${keywords}!`);
				})
		);

		// Add a div to make the slider take all the width
		let sliderValue = 3;
		// TODO : Make the slider taking the all width
		new Setting(contentEl)
			.setName(
				`Keywords minimum occurence to be displayed in the list : `
			)
			.addSlider((slider: any) =>
				slider
					.setLimits(1, 10, 1)
					.setDynamicTooltip()
					.setValue(sliderValue)
					.onChange(async (value: any) => {
						new Notice(`The slider value is ${value}`);
						sliderValue = value;
					})
			);

		//Fucnction to check if the checkbox with the name "Option 1" is checked (return true or false)
		//TODO : Find a better way to see what is checked
		function isChecked(name: string) {
			const checkbox = document.querySelector(
				`input[name='${name}']`
			) as HTMLInputElement;
			return checkbox.checked;
		}

		const centerWithDiv = contentEl.createEl("div", {
			attr: { style: "display: flex; justify-content: center;" },
		});
		new Setting(centerWithDiv).addButton((btn: any) =>
			btn
				.setButtonText("Start Vault Analysis")
				.setCta()
				.onClick(async () => {
					new Notice(`${sliderValue}`);
					new Notice("Starting Vault Analysis");

					// Get the list of all the files in the vault
					const files = this.app.vault.getMarkdownFiles();
					let filePaths = [];
					for (let i = 0; i < files.length; i++) {
						filePaths[i] = path.resolve(vaultPath, files[i].path);
					}
					let extractedKeywords: {
						[word: string]: { count: number; paths: string[] };
					} = {};
					extractedKeywords = await extractKeywords(filePaths);

					// Display the results
					contentEl.append(
						contentEl.createEl("h1", { text: "Results" })
					);
					//TODO : Remove all the "any" types
					// Add a master checkbox to toggle all keyword checkboxes
					const toggleRefs: any = [];
					const selectedKeywords: any = {};

					new Setting(contentEl)
						.setName("Toggle all keywords")
						.addToggle((masterToggle) => {
							masterToggle.onChange((checked) => {
								toggleRefs.forEach((toggleObj: any) => {
									toggleObj.toggle.setValue(checked);
									toggleObj.onChangeFn(checked);
								});
							});
						});

					// Get the array of keyword keys
					const keywordKeys = Object.keys(extractedKeywords);

					// Iterate through the keyword keys array and add checkboxes with the corresponding keywords
					for (let i = 0; i < keywordKeys.length; i++) {
						const keyword = keywordKeys[i];
						selectedKeywords[keyword] = false;

						new Setting(contentEl)
							.setName(keyword)
							.addToggle((toggle) => {
								const onChangeFn = (checked: any) => {
									selectedKeywords[keyword] = checked;
									console.log(
										`Selected keywords: ${getSelectedKeywords()}`
									);
								};

								toggle.onChange(onChangeFn);
								toggleRefs.push({ toggle, onChangeFn });
							});
					}

					function getSelectedKeywords() {
						return Object.keys(selectedKeywords).filter(
							(keyword) => selectedKeywords[keyword]
						);
					}
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
