import {
	App,
	Modal,
	Setting,
	Notice,
	DataAdapter,
	SliderComponent,
	ToggleComponent,
} from "obsidian";
import { extractKeywords } from "../functions/extractKeywords";
import * as path from "path";
import { addDoubleBrackets } from "../functions/addDoubleBrackets";
import { popUpResults } from "./popUpResults";

let minKeywordSliderValue = 3;
let maxKeywordSliderValue = 10;
let numberOfLettersInKeyword = 3;
let minSlider: SliderComponent;
let maxSlider: SliderComponent;

const startVaultAnalysis = async (
	vault: any,
	vaultPath: string,
	contentEl: HTMLElement
) => {
	console.log("JOJO : ", app);

	new Notice("Starting Vault Analysis");

	// Get the list of all the files in the vault
	const files = vault.getMarkdownFiles();
	let filePaths: string[] = [];
	for (let i = 0; i < files.length; i++) {
		filePaths[i] = path.resolve(vaultPath, files[i].path);
	}
	let extractedKeywords: {
		[word: string]: { count: number; paths: string[] };
	} = {};
	extractedKeywords = await extractKeywords(filePaths);
	// Filter the keywords to only keep the ones with a count higher than the minKeywordSliderValue and lower than the maxKeywordSliderValue
	const filteredKeywords = Object.fromEntries(
		Object.entries(extractedKeywords).filter(
			([_, value]) =>
				value.count >= minKeywordSliderValue &&
				value.count <= maxKeywordSliderValue
		)
	);

	//TODO : Prendre en compte dans la fonction le minKeywordSliderValue pour optimiser le temps de traitement

	// Display the results
	contentEl.append(contentEl.createEl("h1", { text: "Results" }));
	const centerAddLinksButtonWithDiv = contentEl.createEl("div", {
		attr: {
			style: "display: flex; justify-content: center;",
		},
	});
	new Setting(centerAddLinksButtonWithDiv).addButton((btn) =>
		btn
			.setButtonText("Add links to the select keywords")
			.setCta()
			.onClick(async () => {
				const { result, numberOfAddedLinks } = await addDoubleBrackets(
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
	// Create interface for toggleRefs
	interface toggleRefs {
		toggle: ToggleComponent;
		onChangeFn: (checked: boolean) => void;
	}

	const toggleRefs: toggleRefs[] = [];
	new Setting(contentEl)
		.setName("Select all keywords")
		.addToggle((masterToggle) => {
			masterToggle.onChange((checked) => {
				toggleRefs.forEach((toggleObj) => {
					toggleObj.toggle.setValue(checked);
					toggleObj.onChangeFn(checked);
				});
			});
		});

	// Add a master checkbox to toggle all keyword checkboxes
	interface selectedKeywords {
		[keyword: string]: boolean;
	}
	const selectedKeywords: selectedKeywords = {};

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
		console.log("SELECTED KEYWORDS : ", selectedKeywords);

		new Setting(contentEl).setName(keyword).addToggle((toggle) => {
			const onChangeFn = (checked: boolean) => {
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
};

// ------------MAIN MODAL---------------- //

export class MainModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		let { contentEl } = this;
		const vaultPath: string = (this.app.vault.adapter as any).basePath;

		console.log("THIS LE PREMIER : ", this);
		contentEl.createEl("h1", {
			text: "Auto Link",
			attr: { style: "text-align: center;" },
		});
		contentEl.createEl("br", {});
		contentEl.createEl("h2", { text: "Parameters :" });

		//TODO Make a loading popup that is automatically closed when it's finished
		new Setting(contentEl).addButton((button) =>
			button.setButtonText("Open Popup").onClick(() => {
				// Instantiate the new modal
				console.log("CONTENT EL : ", contentEl);
				console.log("THIS : ", this);
				const popupModal = new popUpResults(this.app);
				// Open the new modal
				popupModal.open();
			})
		);

		// TODO : Make the slider taking the all width

		const sliderContainer = contentEl.createDiv();
		const sliderLabel1 = sliderContainer.createEl("span", {
			text: `Don't count words with less than ${numberOfLettersInKeyword} letters: `,
		});

		new Setting(sliderContainer).addSlider((slider) =>
			slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(numberOfLettersInKeyword)
				.onChange(async (value) => {
					numberOfLettersInKeyword = value;
					sliderLabel1.textContent = `Don't count words with less than ${numberOfLettersInKeyword} letters: `;
				})
		);
		const sliderLabel2 = sliderContainer.createEl("span", {
			text: `${minKeywordSliderValue} minimum occurences of a word to be counted as a keyword`,
		});

		new Setting(sliderContainer).addSlider((slider) => {
			minSlider = slider;
			return slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(minKeywordSliderValue)
				.onChange(async (value) => {
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

		new Setting(sliderContainer).addSlider((slider) => {
			maxSlider = slider;
			return slider
				.setLimits(1, 10, 1)
				.setDynamicTooltip()
				.setValue(maxKeywordSliderValue)
				.onChange(async (value) => {
					maxKeywordSliderValue = value;
					if (maxKeywordSliderValue <= minKeywordSliderValue) {
						minKeywordSliderValue = maxKeywordSliderValue - 1;
						minSlider.setValue(minKeywordSliderValue);
						sliderLabel2.textContent = `${minKeywordSliderValue} minimum occurences of a word to be counted as a keyword`;
					}
					sliderLabel3.textContent = `${maxKeywordSliderValue} maximum occurences of a word to be counted as a keyword`;
				});
		});

		//TODO : Sepparate this settings action into different function.ts scripts for more maintenance
		const centerAnalysisButtonWithDiv = contentEl.createEl("div", {
			attr: { style: "display: flex; justify-content: center;" },
		});
		new Setting(centerAnalysisButtonWithDiv).addButton((btn) =>
			btn
				.setButtonText("Start Vault Analysis")
				.setCta()
				.onClick(async () => {
					startVaultAnalysis(this.app.vault, vaultPath, contentEl);
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
