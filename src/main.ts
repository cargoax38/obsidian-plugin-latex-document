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
import Utils from './utils.js';

export default class LatexDocument extends Plugin {
	settings!: LatexDocumentSettings;
	params!: Array<Number>;
	tab!: Array<string>;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LatexDocumentSettingTab(this.app, this));

		this.app.workspace.on('layout-change', async () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if(view && view.getMode() == 'preview') {
				const file = this.app.workspace.getActiveFile();
				if(file) {
					// if parametre section a change : on peut le detecter en parcourant chaque p et detecter si l'expression contient des chiffres avec des '.'. Dans ce cas-la changer
					activeDocument.querySelectorAll('.custom-title').forEach(p => {
						// Les vérifications de changement du paramètre d'affichage des sections
					});

					this.app.fileManager.processFrontMatter(file, async fn => {
						if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
							let section: SectionNumber = new SectionNumber(3);

							const content = await this.app.vault.read(file);
							const lines = content.split('\n');

							let tableLine = lines.indexOf('`\\tableofcontents`');

							if(tableLine >= 0) {
								if(lines[tableLine + 2] && lines[tableLine + 2]!.startsWith('<span>')) {
									lines.splice(tableLine + 1, 3);
								}else {
									lines.splice(tableLine + 1, 1);
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
											tableContent.push(this.tab[depth] + this.sectionNumberDisplay(section.toString(), depth) + ' ­ ­ ­' + sectionMatch[2]);
											tableContent.push(mark);
										}
									}
								}
							}

							if(tableLine >= 0 && tableContent.length > 0) {
								lines[tableLine] = '`\\tableofcontents`';

								let tableOfContents = '';

								let i = tableContent.length - 1;
								while(i > 0) {
									tableOfContents = '<span class="entry"><span class="chapter">[' + tableContent[i - 1] + '](' + file.name + '#' + tableContent[i] + ')</span></span>' + tableOfContents
									i -= 2;
								}
								tableOfContents = '\n<span>' + tableOfContents + '</span>\n'

								lines.splice(tableLine + 1, 0, tableOfContents);
							}

							await this.app.vault.modify(file, lines.join('\n'));
						}
					});
				}
			}
		});

		this.registerMarkdownPostProcessor((element, ctx) => {
			const file = this.app.vault.getFileByPath(ctx.sourcePath) as TFile; // la note associé au texte. Donc pour les liens embed, c'est le fichier source.
			//const currentFile = this.app.workspace.getActiveFile() as TFile; // Le fichier actuellement ouvert (ou non si c'est la vue graphique par exemple).

			if (!file) return;
			this.app.fileManager.processFrontMatter(file, fn => {
				if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
					element.querySelectorAll('code').forEach(async p => {
						if(!ctx.getSectionInfo(element)) return;
						const text = p.textContent?.trim() ?? '';

						const tableMatch = text.match(/^\\tableofcontents$/);
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
							header.addClass('custom-title');
							header.textContent = this.sectionNumberDisplay(sectionMatch[3], depth) + ' ­ ­ ­' + sectionMatch[2];
							p.replaceWith(header);
						}
					});
				}
			});
		});
	}

	sectionNumberDisplay(rawNumber: string, depth: number) : string {
		const sectionNumbers = rawNumber.split('-');

		let result = '';

		if(this.settings.displayFullSection) {
			for(let i = 0; i < depth + 1; i++) {
				if(i > 0) result = result + '.';
				switch(this.params[i]) {
					case 0: {
						result = result + sectionNumbers[i];
						break;
					}
					case 1: {
						result = result + Utils.decimalToRoman('' + sectionNumbers[i]);
						break;
					}
					case 2: {
						result = result + Utils.decimalToAlphabet('' + sectionNumbers[i], false);
						break;
					}
				}
			}
		}else {
			switch(this.params[depth]) {
				case 0: {
					result = result + sectionNumbers[depth];
					break;
				}
				case 1: {
					result = result + Utils.decimalToRoman('' + sectionNumbers[depth]);
					break;
				}
				case 2: {
					result = result + Utils.decimalToAlphabet('' + sectionNumbers[depth], false);
					break;
				}
			}
		}

		return result;
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<LatexDocumentSettings>,
		);

		this.params = [1, 0, 2];
		this.tab = ['', '­ ­ ­ ­', '­ ­ ­ ­ ­ ­ ­ ­'];
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}