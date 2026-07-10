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

interface NoteFrontmatter {
    cssclasses?: string[];
}

export default class LatexDocument extends Plugin {
	settings!: LatexDocumentSettings;
	tab!: Array<string>;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LatexDocumentSettingTab(this.app, this));

		this.app.workspace.on('layout-change', async () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if(view && view.getMode() == 'preview') {
				const file = this.app.workspace.getActiveFile();
				if(file) {
					const fm = this.app.metadataCache.getFileCache(file);
					const frontmatter = fm?.frontmatter as NoteFrontmatter | undefined;

					if(frontmatter?.cssclasses && frontmatter.cssclasses.contains(this.settings.noteClass)) {
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

						let tableContent: Array<string> = [];

						for(let i = 0; i < lines.length; i++) {
							const text = lines[i] as string;
							const sectionMatch = text.match(/^`(\\|\\sub|\\subsub)section\{(.+)\}(|\[\d+-\d+-\d+\])`$/);

							if(sectionMatch && sectionMatch[1]) {
								const depth = (sectionMatch[1].length - 1) / 3;

								if(section.safeNext(depth)) {
									section.next(depth);

									const newSection = '`' + sectionMatch[1] + 'section{' + sectionMatch[2] + '}[' + section.toString() + ']`';

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
										tableContent.push('depth-' + this.tab[depth] || 'depth-h1');
										tableContent.push(this.sectionNumberDisplay(section.toString(), depth) + ' ­ ­ ­' + sectionMatch[2]);
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
								tableOfContents = '<span class="entry"><span class="chapter ' + tableContent[i - 2] + '">[' + tableContent[i - 1] + '](' + file.name + '#' + tableContent[i] + ')</span></span>' + tableOfContents
								i -= 3;
							}
							tableOfContents = '\n<span>' + tableOfContents + '</span>\n'

							lines.splice(tableLine + 1, 0, tableOfContents);
						}

						await this.app.vault.modify(file, lines.join('\n'));
					}
				}
			}
		});

		this.registerMarkdownPostProcessor((element, ctx) => {
			const file = this.app.vault.getFileByPath(ctx.sourcePath) // la note associé au texte. Donc pour les liens embed, c'est le fichier source.
			//const currentFile = this.app.workspace.getActiveFile() as TFile; // Le fichier actuellement ouvert (ou non si c'est la vue graphique par exemple).

			if (!file || !(file instanceof TFile)) return;
			
			const fm = this.app.metadataCache.getFileCache(file);
			const frontmatter = fm?.frontmatter as NoteFrontmatter | undefined;

			if(frontmatter?.cssclasses && frontmatter.cssclasses.contains(this.settings.noteClass)) {
				element.querySelectorAll('code').forEach(p => {
					if(!ctx.getSectionInfo(element)) return;
					const text = p.textContent?.trim() ?? '';

					const tableMatch = text.match(/^\\tableofcontents$/);
					if(tableMatch) {
						const header = p.createEl('h1');
						header.textContent = this.settings.tableOfContents;
						p.replaceWith(header);

						return;
					}

					const sectionMatch = text.match(/^(\\|\\sub|\\subsub)section\{(.+)\}\[(\d+-\d+-\d+)\]$/);
					if(sectionMatch && sectionMatch[1] && sectionMatch[2] && sectionMatch[3]) {
						const depth = (sectionMatch[1].length - 1) / 3;

						const title = p.createEl(this.tab[depth] as keyof HTMLElementTagNameMap || 'h1');

						const header = title.createSpan();
						const headerNumber = title.createSpan();

						title.addClass('custom-title');
						header.addClass('custom-section');
						headerNumber.addClass('custom-number');

						headerNumber.textContent = this.sectionNumberDisplay(sectionMatch[3], depth)
						header.textContent = sectionMatch[2];

						title.appendChild(headerNumber);
						title.appendChild(header);
						p.replaceWith(title);
					}
				});
			}
		});
	}

	sectionNumberDisplay(rawNumber: string, depth: number) : string {
		const sectionNumbers = rawNumber.split('-');

		let result = '';

		if(this.settings.displayFullSection) {
			for(let i = 0; i < depth + 1; i++) {
				if(i > 0) result = result + '.';
				result = result + Utils.writeSectionNumber(sectionNumbers, this.settings.renderSections, i);
			}
		}else result = Utils.writeSectionNumber(sectionNumbers, this.settings.renderSections, depth);

		return result;
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<LatexDocumentSettings>,
		);

		this.tab = ['h1', 'h2', 'h3'];
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}