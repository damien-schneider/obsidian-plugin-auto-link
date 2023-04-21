import { App, Modal, Setting } from "obsidian";

export class MainModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Auto Link" });

		new Setting(contentEl).setName("Name").addText((text: any) =>
			text.onChange((value: any) => {
				this.result = value;
			})
		);

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
