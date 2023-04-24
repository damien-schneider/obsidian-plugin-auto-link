import { App, Modal } from "obsidian";

export class popUpResults extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "This is a popup modal" });
		contentEl.createEl("p", {
			text: "You can add any content you want here.",
		});
	}
}
