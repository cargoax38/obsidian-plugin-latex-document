import { App, PluginSettingTab, Setting, SettingTab, SliderComponent } from 'obsidian';
import LatexDocument from './main.js';

export interface LatexDocumentSettings {
	noteClass: string,
	displayFullSection: boolean;
}

export const DEFAULT_SETTINGS: LatexDocumentSettings = {
	noteClass: 'math-article',
	displayFullSection: true
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
			)
		
		new Setting(containerEl)
			.setName('Render full section')
			.setDesc('Display the whole section number, such as 1.1.7 or just the local number 7')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.displayFullSection)
					.onChange(async (value) => {
						this.plugin.settings.displayFullSection = value;
						await this.plugin.saveSettings();
					});
			});

		/*new Setting(containerEl)
			.setName('Render section')
			.setDesc('How to render the section numbers')
			.addDropdown((component) => {
				component.addOption('0', 'Number');
				component.addOption('1', 'Roman');
				component.addOption('2', 'Alphabet');
			})*/
	}
}
