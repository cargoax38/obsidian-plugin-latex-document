import {
	MarkdownView,
	Plugin,
	TFile,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	LatexDocumentSettings,
	LatexDocumentSettingTab,
} from './settings.js';

export default class LatexDocument extends Plugin {
	settings!: LatexDocumentSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LatexDocumentSettingTab(this.app, this));

		const numbers = new Map<string, number>();

		this.registerMarkdownPostProcessor((element, ctx) => {
			const file = this.app.vault.getFileByPath(ctx.sourcePath) as TFile;
			const currentFile = this.app.workspace.getActiveFile() as TFile;

			if (!file || !currentFile) return;
			this.app.fileManager.processFrontMatter(file, fn => {
				if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
					element.querySelectorAll('code').forEach(async p => {
						const text = p.textContent?.trim() ?? '';

						const tableMatch = text.match(/^\\tableofcontents$/);

						console.log(p);
						if(p.closest('.markdown-embed-content') && currentFile.path == ctx.sourcePath) {
							return;
						}

						if(tableMatch) {
							numbers.set(ctx.sourcePath, 1);
						}else {
							const sectionMatch = text.match(/^\\section\{(.+)\}$/);

							if(sectionMatch && sectionMatch[1]) { // It's a section `\section{text}`
								const i = numbers.get(ctx.sourcePath) || 0;

								if(ctx.getSectionInfo(element)) {
									const content = await this.app.vault.read(file);
									const lines = content.split('\n');

									if(ctx == null || element == null || ctx.getSectionInfo(element) == null) return;
									const line = ctx.getSectionInfo(element)?.lineStart;

									if(line == null) return;

									if((lines[line + 2] === undefined || !lines[line + 2].contains("^part")) && file == currentFile) {
										const h1 = activeDocument.createElement('h1');
										h1.textContent = i + ' ­ ­ ­' + sectionMatch[1];
										p.replaceWith(h1);

										lines.splice(line + 1, 0, '');
										lines.splice(line + 1, 0, '^part' + i + '');
										lines.splice(line + 1, 0, '');

										console.log('adds');
										await this.app.vault.modify(file, lines.join('\n'));
									}else {
										const sectionNumber = lines[line + 2].match(/^\^part(\d+)$/);

										if(sectionNumber && sectionNumber[1]) {
											const h1 = activeDocument.createElement('h1');
											h1.textContent = sectionNumber[1] + ' ­ ­ ­' + sectionMatch[1];
											p.replaceWith(h1);
										}
									}
								}
								numbers.set(ctx.sourcePath, i + 1);

								/*if(ctx.getSectionInfo(element) != null) {
									const line = ctx.getSectionInfo(element).lineEnd;

									if(this.app.workspace.activeEditor) {
										const editor = this.app.workspace.activeEditor.editor;
										if(editor != undefined) {

											editor.replaceRange("some text", {line: 8 + 1, ch: 0});
										}
									}
								}*/
							}
						}
					});
				}
			});
		});

		/*this.addCommand({
			id: 'insert-text',
			name: 'Insert text',
			editorCallback: (editor, view) => {
				activeDocument.querySelectorAll('code').forEach(p => {
					editor.replaceRange("some text", {line: , ch: 0});
				}
			}
		});*/
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<LatexDocumentSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}