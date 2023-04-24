import { App, Modal, Setting, Notice, DataAdapter } from "obsidian";
import { extractKeywords } from "../functions/extractKeywords";
import * as path from "path";
import { addDoubleBrackets } from "../functions/addDoubleBrackets";

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
		let numberOfLettersInKeyword = 3;
		let minSlider: any;
		let maxSlider: any;

		// TODO : Make the slider taking the all width

		const sliderContainer = contentEl.createDiv();
		const sliderLabel1 = sliderContainer.createEl("span", {
			text: `Don't count words with less than ${numberOfLettersInKeyword} letters: `,
		});

		new Setting(sliderContainer).addSlider((slider: any) =>
			slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(numberOfLettersInKeyword)
				.onChange(async (value: any) => {
					numberOfLettersInKeyword = value;
					sliderLabel1.textContent = `Don't count words with less than ${numberOfLettersInKeyword} letters: `;
				})
		);
		const sliderLabel2 = sliderContainer.createEl("span", {
			text: `${minKeywordSliderValue} minimum occurences of a word to be counted as a keyword`,
		});

		new Setting(sliderContainer).addSlider((slider: any) => {
			minSlider = slider;
			return slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(minKeywordSliderValue)
				.onChange(async (value: any) => {
					minKeywordSliderValue = value;
					if (minKeywordSliderValue >= maxKeywordSliderValue) {
						maxKeywordSliderValue = minKeywordSliderValue + 1;
						maxSlider.setValue(maxKeywordSliderValue);
						sliderLabel3.textContent = `${maxKeywordSliderValue} maximum occurences of a word to be counted as a keyword`;
					}
					sliderLabel2.textContent = `${minKeywordSliderValue} minimum occurences of a word to be counted as a keyword`;
				});
		});
		const sliderLabel3 = sliderContainer.createEl("span", {
			text: `${maxKeywordSliderValue} maximum occurences of a word to be counted as a keyword`,
		});

		new Setting(sliderContainer).addSlider((slider: any) => {
			maxSlider = slider;
			return slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(maxKeywordSliderValue)
				.onChange(async (value: any) => {
					maxKeywordSliderValue = value;
					if (maxKeywordSliderValue <= minKeywordSliderValue) {
						minKeywordSliderValue = maxKeywordSliderValue - 1;
						minSlider.setValue(minKeywordSliderValue);
						sliderLabel2.textContent = `${minKeywordSliderValue} minimum occurences of a word to be counted as a keyword`;
					}
					sliderLabel3.textContent = `${maxKeywordSliderValue} maximum occurences of a word to be counted as a keyword`;
				});
		});

		//Fucnction to check if the checkbox with the name "Option 1" is checked (return true or false)
		//TODO : Find a better way to see what is checked
		function isChecked(name: string) {
			const checkbox = document.querySelector(
				`input[name='${name}']`
			) as HTMLInputElement;
			return checkbox.checked;
		}
		//TODO : Sepparate this settings action into different function.ts scripts for more maintenance
		const centerAnalysisButtonWithDiv = contentEl.createEl("div", {
			attr: { style: "display: flex; justify-content: center;" },
		});
		new Setting(centerAnalysisButtonWithDiv).addButton((btn: any) =>
			btn
				.setButtonText("Start Vault Analysis")
				.setCta()
				.onClick(async () => {
					new Notice(`${minKeywordSliderValue}`);
					new Notice("Starting Vault Analysis");

					// Get the list of all the files in the vault
					const files = this.app.vault.getMarkdownFiles();
					let filePaths: string[] = [];
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
					const centerAddLinksButtonWithDiv = contentEl.createEl(
						"div",
						{
							attr: {
								style: "display: flex; justify-content: center;",
							},
						}
					);
					new Setting(centerAddLinksButtonWithDiv).addButton(
						(btn: any) =>
							btn
								.setButtonText(
									"Add links to the select keywords"
								)
								.setCta()
								.onClick(async () => {
									const { result, numberOfAddedLinks } =
										await addDoubleBrackets(
											getSelectedKeywords(),
											filePaths
										);
									if (Object.keys(result)) {
										console.log(
											`${numberOfAddedLinks} new links have been added in your vault`
										);
									} else {
										console.log(
											"An error occurred while adding double brackets."
										);
									}
								})
					);

					const toggleRefs: any = [];
					new Setting(contentEl)
						.setName("Select all keywords")
						.addToggle((masterToggle) => {
							masterToggle.onChange((checked) => {
								toggleRefs.forEach((toggleObj: any) => {
									toggleObj.toggle.setValue(checked);
									toggleObj.onChangeFn(checked);
								});
							});
						});

					//TODO : Remove all the "any" types
					// Add a master checkbox to toggle all keyword checkboxes
					const selectedKeywords: any = {};

					// Get the array of keyword keys
					const keywordKeys = Object.keys(filteredKeywords);
					contentEl.append(
						contentEl.createEl("h2", {
							text: `${keywordKeys.length} Keywords have been found in your vault`,
						})
					);

					// Iterate through the keyword keys array and add checkboxes with the corresponding keywords
					for (let i = 0; i < keywordKeys.length; i++) {
						const keyword = keywordKeys[i];
						selectedKeywords[keyword] = false;

						new Setting(contentEl)
							.setName(keyword)
							.addToggle((toggle) => {
								const onChangeFn = (checked: any) => {
									selectedKeywords[keyword] = checked;
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
