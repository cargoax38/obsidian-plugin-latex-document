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
			this.app.fileManager.processFrontMatter(file, fn => {
				if(fn.cssclasses && fn.cssclasses.contains(this.settings.noteClass)) {
					element.querySelectorAll('p').forEach(p => {
						const text = p.textContent?.trim() ?? '';

						const tableMatch = text.match(/^\\tableofcontents$/);

						if(tableMatch) {
							numbers.set(ctx.sourcePath, 1);
						}else {
							const sectionMatch = text.match(/^\\section\{(.+)\}$/);

							if(!sectionMatch || !sectionMatch[1]) return;

							const h1 = activeDocument.createElement('h1');

							console.log(ctx.sourcePath);
							const i = numbers.get(ctx.sourcePath) || 0;
							h1.textContent = i + ' ­ ­ ­' + sectionMatch[1];
							p.replaceWith(h1);
							numbers.set(ctx.sourcePath, i + 1);
						}
					});
				}
			});
		})

		this.addCommand({
			id: 'latex-document-sec',
			name: 'Sections seeker',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile() as TFile;
				console.log(activeFile.name);

				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if(!activeView) return;

				setTimeout(() => {
					const container = activeView.containerEl.querySelector('.markdown-preview-view');
					if(!container) return;

					const codeBlock = container.querySelectorAll('code');

					codeBlock.forEach((p) => {
						const text = p.textContent?.trim() ?? '';

						const match = text.match(/^\\section\{(.+)\}$/);

						if(!match || !match[1]) return;

						const h1 = activeDocument.createElement('h1');

						h1.textContent = ' ­ ­ ­' + match[1];
						p.replaceWith(h1);
					});
				}, 100);

				/*this.app.vault.read(activeFile).then((contenuFichier) => {
					console.log("Contenu du fichier :", contenuFichier);
				});*/
			}});
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