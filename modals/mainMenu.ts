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

		// Add a div to make the slider take all the width
		let minKeywordSliderValue = 3;
		let maxKeywordSliderValue = 10;
		// TODO : Make the slider taking the all width
		new Setting(contentEl)
			.setName(
				`Keywords minimum occurence to be displayed in the list : `
			)
			.addSlider((slider: any) =>
				slider
					.setLimits(1, 10, 1)
					.setDynamicTooltip()
					.setValue(minKeywordSliderValue)
					.onChange(async (value: any) => {
						new Notice(`The slider value is ${value}`);
						minKeywordSliderValue = value;
					})
			);
		//TODO : Limit conflict to not allow min > max
		new Setting(contentEl)
			.setName(
				`Keywords maximum occurence to be displayed in the list : `
			)
			.addSlider((slider: any) =>
				slider
					.setLimits(1, 100, 1)
					.setDynamicTooltip()
					.setValue(maxKeywordSliderValue)
					.onChange(async (value: any) => {
						new Notice(`The slider value is ${value}`);
						maxKeywordSliderValue = value;
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
					new Notice(`${minKeywordSliderValue}`);
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
					console.log("extractedKeywords : ", extractedKeywords);
					// Filter the keywords to only keep the ones with a count higher than the minKeywordSliderValue and lower than the maxKeywordSliderValue
					const filteredKeywords = Object.fromEntries(
						Object.entries(extractedKeywords).filter(
							([_, value]) =>
								value.count >= minKeywordSliderValue &&
								value.count <= maxKeywordSliderValue
						)
					);
					console.log("filteredKeywords : ", filteredKeywords);

					//TODO : Prendre en compte dans la fonction le minKeywordSliderValue pour optimiser le temps de traitement

					// Display the results
					contentEl.append(
						contentEl.createEl("h1", { text: "Results" })
					);
					contentEl.append(
						contentEl.createEl("h2", {
							text: `Voici les résultats avec ${minKeywordSliderValue} occurences minimum et ${maxKeywordSliderValue} occurences maximum : `,
						})
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
					const keywordKeys = Object.keys(filteredKeywords);

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
