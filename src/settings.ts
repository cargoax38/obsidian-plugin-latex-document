import { App, PluginSettingTab, SettingGroup } from 'obsidian';
import LatexDocument from './main.js';

export interface LatexDocumentSettings {
	noteClass: string,
	tableOfContents: string,
	displayFullSection: boolean,
	renderSections: Array<string>;
}

export const DEFAULT_SETTINGS: LatexDocumentSettings = {
	noteClass: 'math-article',
	tableOfContents: 'Table of contents',
	displayFullSection: true,
	renderSections: ['0', '0', '0']
};

export class LatexDocumentSettingTab extends PluginSettingTab {
	plugin: LatexDocument;

	constructor(app: App, plugin: LatexDocument) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [{
			name: 'Support',
			desc: 'This version (higher than 1.13.0) is not yet supported',
		}];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new SettingGroup(containerEl)
			.addSetting(cb => {
				cb.setName('Note cssclass');
				cb.setDesc('Name the cssclass that LaTeX-like notes will follow.');
				cb.addText((text) => {
					text
						.setPlaceholder('Cssclass property')
						.setValue(this.plugin.settings.noteClass)
						.onChange(async (value) => {
							this.plugin.settings.noteClass = value;
							await this.plugin.saveSettings();
						})
				});
			})
			.addSetting(cb => {
				cb.setName('Table of content display');
				cb.setDesc('Spicify the text of the table of contents section')
				cb.addText((text) => {
					text
						.setPlaceholder('Table of content section')
						.setValue(this.plugin.settings.tableOfContents)
						.onChange(async (value) => {
							this.plugin.settings.tableOfContents = value;
							await this.plugin.saveSettings();
						}) 
				})
			}).setHeading('General')

		new SettingGroup(containerEl)
			.addSetting(cb => {
				cb.setName('Render full section');
				cb.setDesc('Display the whole section number, such as 1.1.7 or just the local number 7. You\'ll have to change the note the completely update the numbers.');
				cb.addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.displayFullSection)
						.onChange(async (value) => {
							this.plugin.settings.displayFullSection = value;
							await this.plugin.saveSettings();
						});
				});
			})
			.addSetting(cb => {
				cb.setName('Render section');
				cb.setDesc('How to render the section numbers.');
				cb.addDropdown((component) => {
					component.addOption('0', 'Number');
					component.addOption('1', 'Roman');
					component.addOption('2', 'Alphabet');
					component.setValue(this.plugin.settings.renderSections[0] || '0');
					component.onChange(async (value) => {
						this.plugin.settings.renderSections[0] = value;
						await this.plugin.saveSettings();
					});
				});
			})
			.addSetting(cb => {
				cb.setName('Render subsection');
				cb.setDesc('How to render the subsection numbers.');
				cb.addDropdown((component) => {
					component.addOption('0', 'Number');
					component.addOption('1', 'Roman');
					component.addOption('2', 'Alphabet');
					component.setValue(this.plugin.settings.renderSections[1] || '0');
					component.onChange(async (value) => {
						this.plugin.settings.renderSections[1] = value;
						await this.plugin.saveSettings();
					});
				});
			})
			.addSetting(cb => {
				cb.setName('Render subsubsection');
				cb.setDesc('How to render the subsubsection numbers.');
				cb.addDropdown((component) => {
					component.addOption('0', 'Number');
					component.addOption('1', 'Roman');
					component.addOption('2', 'Alphabet');
					component.setValue(this.plugin.settings.renderSections[2] || '0');
					component.onChange(async (value) => {
						this.plugin.settings.renderSections[2] = value;
						await this.plugin.saveSettings();
					});
				});
			})
			.setHeading('Number rendering')
	}
}
