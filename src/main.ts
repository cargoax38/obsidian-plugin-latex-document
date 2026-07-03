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

		this.app.workspace.on('quick-preview', () => {
			console.log("test");
		})

		this.app.workspace.on('file-open', () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if(!activeView) return;

			setTimeout(() => {
				const container = activeView.containerEl.querySelector('.markdown-preview-view');
				if(!container) return;

				const codeBlock = container.querySelectorAll('code');

				codeBlock.forEach((block) => {
					if(block.textContent.contains('\\test')) {
						const h1 = activeDocument.createElement('h1');
						h1.textContent = 'Test';

						block.parentElement?.replaceWith(h1);
					}
				});
			}, 100);
		});

		this.addCommand({
			id: 'latex-document-sec',
			name: 'Sections seeker',
			callback: () => {
				//const activeFile = this.app.workspace.getActiveFile() as TFile;

				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if(!activeView) return;

				setTimeout(() => {
					const container = activeView.containerEl.querySelector('.markdown-preview-view');
					if(!container) return;

					const codeBlock = container.querySelectorAll('code');

					codeBlock.forEach((block) => {
						if(block.textContent.contains('\\test')) {
							const h1 = activeDocument.createElement('h1');
							h1.textContent = 'Test';

							block.parentElement?.replaceWith(h1);
						}
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