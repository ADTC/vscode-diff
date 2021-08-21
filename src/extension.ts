import * as vscode from 'vscode';
const { exec } = require('child_process');
const fs = require('fs');

function execute(command: string): Promise<string>{
	return new Promise((resolve, reject) => {
		exec(command, function(error: string, stdout: string, stderr: string){
			resolve(stdout);
		});
	});
}

const writeTemp = (path: string, data: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, () => {
			resolve();
		});
	});
};

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.viewAllDiffInOneBuffer', async () => {
		const filename = Math.random().toString(36).slice(2) + '.diff'
		const path = vscode.workspace.rootPath;
		const temp = `${path}/.git/.huytd/${filename}`;
		// Windows commands ("del" won't work in *nix!)
		await execute(`cd ${path}/.git && mkdir .huytd & cd .huytd && del /Q *.diff`);
		const output: string = await execute(`cd ${path} && git diff`);
		await writeTemp(temp, output);
		const uri = vscode.Uri.file(temp);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, { preview: false });
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
