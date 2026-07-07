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
import SectionNumber from './sectionNumber.js';

export default class LatexDocument extends Plugin {
	settings!: LatexDocumentSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LatexDocumentSettingTab(this.app, this));

		this.app.workspace.on('layout-change', async () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if(view && view.getMode() == 'preview') {
				const file = this.app.workspace.getActiveFile();
				if(file) {
					this.app.fileManager.processFrontMatter(file, async fn => {
						if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
							let section: SectionNumber = new SectionNumber(3);
							let counter: number = 0;

							const content = await this.app.vault.read(file);
							const lines = content.split('\n');

							let tableLine = -1;
							for(let i = 0; i < lines.length; i++) {
								if(lines[i]?.startsWith('`\\tableofcontents')) {
									tableLine = i;
									break;
								}
							}

							if(tableLine >= 0) {
								const tableMatch = lines[tableLine]?.match(/^`\\tableofcontents\[(\d+)\]`$/);

								if(tableMatch && tableMatch[1]) {
									const k = +tableMatch[1] || 1;
									lines.splice(tableLine + 1, 1);
									for(let i = 0; i < k; i++) {
										lines.splice(tableLine + 1, 1);
									}
								}
							}

							let tableContent: Array<string> = new Array();

							for(let i = 0; i < lines.length; i++) {
								const text = lines[i] as string;
								const sectionMatch = text.match(/^`(\\|\\sub|\\subsub)section\{(.+)\}(|\[\d+-\d+-\d+\])`$/);

								if(sectionMatch && sectionMatch[1]) {
									const depth = (sectionMatch[1].length - 1) / 3;

									if(section.safeNext(depth)) {
										section.next(depth);
										counter++;

										const newSection = '`' + sectionMatch[1] + 'section\{' + sectionMatch[2] + '\}\[' + section.toString() + '\]`';

										if(lines[i] != newSection) lines[i] = newSection;

										const mark = '^part' + section.toString();
										if(lines[i + 2]) {
											const partMatch = lines[i + 2]?.match(/^\^part(\d+-\d+-\d+)$/)

											if(partMatch && partMatch[1]) {
												if(partMatch[1] != section.toString()) {
													lines[i + 2] = mark;
												}
											}else {
												lines.splice(i + 1, 0, '\n' + mark);
											}
										}else {
											lines.splice(i + 1, 0, '\n' + mark);
										}

										if(tableLine >= 0) {
											tableContent.push(section.toString().substring(0, 1 + depth * 2) + ' ­ ­ ­' + sectionMatch[2]);
											tableContent.push(mark);
										}
									}
								}
							}

							if(tableLine >= 0) {
								if(counter != 0) lines[tableLine] = '`\\tableofcontents[' + counter + ']`';
								else lines[tableLine] = '`\\tableofcontents`';

								let i = tableContent.length - 1;
								while(i > 0) {
									lines.splice(tableLine + 1, 0, '<span class="table-of-contents">[' + tableContent[i - 1] + '](' + file.name + '#' + tableContent[i] + ')</span>');
									i -= 2;
								}

								if(counter != 0) lines.splice(tableLine + 1, 0, '');
							}

							await this.app.vault.modify(file, lines.join('\n'));
						}
					});
				}
			}
		});

		this.registerMarkdownPostProcessor((element, ctx) => {
			const file = this.app.vault.getFileByPath(ctx.sourcePath) as TFile;
			const currentFile = this.app.workspace.getActiveFile() as TFile;

			if (!file || !currentFile) return;
			this.app.fileManager.processFrontMatter(file, fn => {
				if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
					element.querySelectorAll('code').forEach(async p => {
						if(!ctx.getSectionInfo(element)) return;
						const text = p.textContent?.trim() ?? '';

						//if(p.closest('.markdown-embed-content') && currentFile.path == ctx.sourcePath) {
						//	return;
						//}

						const tableMatch = text.match(/^\\tableofcontents\[\d+\]$/);
						if(tableMatch) {
							const header = activeDocument.createElement('h1');
							header.textContent = 'Table des matières';
							p.replaceWith(header);

							return;
						}

						let tab = ['h1', 'h2', 'h3'];

						const sectionMatch = text.match(/^(\\|\\sub|\\subsub)section\{(.+)\}\[(\d+-\d+-\d+)\]$/);
						if(sectionMatch && sectionMatch[1] && sectionMatch[2] && sectionMatch[3]) {
							const depth = (sectionMatch[1].length - 1) / 3;

							const header = activeDocument.createElement(tab[depth] || 'h1');
							header.textContent = sectionMatch[3].substring(0, 1 + depth * 2) + ' ­ ­ ­' + sectionMatch[2];
							p.replaceWith(header);
						}
					});
				}
			});
		});
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