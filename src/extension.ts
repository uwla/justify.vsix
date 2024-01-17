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

    registerCommand("justify.justifyCurrentFile", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Get the full text of the current file.
        const fullText = editor.document.getText();

        // Justify the original text.
        const justifiedText = justify(fullText);

        // Replace the entire file contents with the new text.
        editor.edit((editBuilder) => {
            // Document
            const document = editor.document;

            // Start of the document
            const documentStart = new vscode.Position(0, 0);

            // End of the document
            const lineEnd = document.lineCount - 1;
            const characterEnd = document.lineAt(lineEnd - 1).text.length;
            const documentEnd = new vscode.Position(lineEnd, characterEnd);

            // Replacement range
            const wholeDocumentRange = new vscode.Range(documentStart, documentEnd);

            // Finally, replace it.
            editBuilder.replace(wholeDocumentRange, justifiedText);
        });
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
