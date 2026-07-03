import { App, PluginSettingTab, Setting } from 'obsidian';
import LatexDocument from './main.js';

export interface LatexDocumentSettings {
	noteClass: string;
}

export const DEFAULT_SETTINGS: LatexDocumentSettings = {
	noteClass: 'math-article',
};

export class LatexDocumentSettingTab extends PluginSettingTab {
	plugin: LatexDocument;

	constructor(app: App, plugin: LatexDocument) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Note cssclass')
			.setDesc("Name the cssclass that LaTeX-like notes will follow.")
			.addText((text) =>
				text
					.setPlaceholder('cssclass property')
					.setValue(this.plugin.settings.noteClass)
					.onChange(async (value) => {
						this.plugin.settings.noteClass = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
