// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// Import our main library
const justify = require("@uwlajs/justify").justify;

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext) {
    function registerCommand(cmd: string, callback: (...args: any[]) => any) {
        const disposable = vscode.commands.registerCommand(cmd, callback);
        context.subscriptions.push(disposable);
    }

    registerCommand("justify.justifySelection", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Get selected text.
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        // Justify the original text.
        const justifiedText = justify(selectedText);

        // Replace the selected text with the new text.
        editor.edit((editBuilder) => {
            editBuilder.replace(selection, justifiedText);
        });
    });

}

// This method is called when your extension is deactivated
export function deactivate() {}
