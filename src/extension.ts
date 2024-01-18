// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// Import our main library
const justify = require("@uwlajs/justify").default;

// Main functions
function justifySelection(editor: vscode.TextEditor, n: number = 80) {
    // Get selected text.
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    // Justify the original text.
    const justifiedText = justify(selectedText, n);

    // Replace the selected text with the new text.
    editor.edit((editBuilder) => {
        editBuilder.replace(selection, justifiedText);
    });
}

function justifyFile(editor: vscode.TextEditor, n: number = 80) {
    // Get the full text of the current file.
    const fullText = editor.document.getText();

    // Justify the original text.
    const justifiedText = justify(fullText);

    // Document.
    const document = editor.document;

    // Start of the document.
    const documentStart = new vscode.Position(0, 0);

    // End of the document.
    const lineEnd = document.lineCount - 1;
    const characterEnd = document.lineAt(lineEnd - 1).text.length;
    const documentEnd = new vscode.Position(lineEnd, characterEnd);

    // Replacement range.
    const wholeDocumentRange = new vscode.Range(documentStart, documentEnd);

    // Replace the entire file contents with the new text.
    editor.edit((editBuilder) => {
        editBuilder.replace(wholeDocumentRange, justifiedText);
    });
}

function justifyLine(editor: vscode.TextEditor, n: number = 80) {
    // Get current line.
    const currentPosition = editor.selection.active;
    const currentLine = editor.document.lineAt(currentPosition.line).text;

    // Justify the original text.
    const justifiedText = justify(currentLine);

    // Determine range.
    const lineStart = new vscode.Position(currentPosition.line, 0);
    const lineEnd = new vscode.Position(currentPosition.line, currentLine.length);
    const lineRange = new vscode.Range(lineStart, lineEnd);

    // Replace the text of the current line with the new text.
    editor.edit((editBuilder) => {
        editBuilder.replace(lineRange, justifiedText);
    });
}

function justifyParagraph(editor: vscode.TextEditor, n: number = 80) {
    // Get the positions for the paragraph range.
    const currentPosition = editor.selection.active;
    const startLine = findParagraphStart(editor, currentPosition.line);
    const endLine = findParagraphEnd(editor, currentPosition.line);
    const endCol = editor.document.lineAt(endLine).text.length;

    // Get the paragraph range.
    const paragraphStart = new vscode.Position(startLine, 0);
    const paragraphEnd = new vscode.Position(endLine, endCol);
    const paragraphRange = new vscode.Range(paragraphStart, paragraphEnd);

    // Get the original text.
    const currentParagraph = editor.document.getText(paragraphRange);

    // Justify the original text.
    const justifiedText = justify(currentParagraph);

    editor.edit((editBuilder) => {
        editBuilder.replace(paragraphRange, justifiedText);
    });
}

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext) {

    // wrapper to register commands without repeating code.
    function registerCommand(cmd: string, callback: (...args: any[]) => any) {
        // actual callback.
        const cmdCallback = () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                callback(editor);
            }
        };

        // register cmd.
        const disposable = vscode.commands.registerCommand(cmd, cmdCallback);

        context.subscriptions.push(disposable);
    }

    registerCommand("justify.justifySelection", justifySelection);
    registerCommand("justify.justifyCurrentFile", justifyFile);
    registerCommand("justify.justifyCurrentLine", justifyLine);
    registerCommand("justify.justifyCurrentParagraph", justifyParagraph);
}

function findParagraphStart(editor: vscode.TextEditor, line: number): number {
    while (line > 0 && !editor.document.lineAt(line - 1).isEmptyOrWhitespace) {
        line--;
    }
    return line;
}

function findParagraphEnd(editor: vscode.TextEditor, line: number): number {
    const lastLine = editor.document.lineCount - 1;
    while (line < lastLine && !editor.document.lineAt(line + 1).isEmptyOrWhitespace
    ) {
        line++;
    }
    return line;
}

// This method is called when your extension is deactivated
export function deactivate() {}
