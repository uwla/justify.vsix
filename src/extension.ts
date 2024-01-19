// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// Import our main library
const justify = require("@uwlajs/justify").default;

// Type definitions.
type callback = (...args : any[]) => any;

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
    const justifiedText = justify(fullText, n);

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
    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line).text;

    // Justify the original text.
    const justifiedText = justify(line, n);

    // Determine range.
    const lineStart = new vscode.Position(position.line, 0);
    const lineEnd = new vscode.Position(position.line, line.length);
    const lineRange = new vscode.Range(lineStart, lineEnd);

    // Replace the text of the current line with the new text.
    editor.edit((editBuilder) => {
        editBuilder.replace(lineRange, justifiedText);
    });
}

function justifyParagraph(editor: vscode.TextEditor, n: number = 80) {
    // Get the positions for the paragraph range.
    const position = editor.selection.active;
    const startLine = findParagraphStart(editor, position.line);
    const endLine = findParagraphEnd(editor, position.line);
    const endCol = editor.document.lineAt(endLine).text.length;

    // Get the paragraph range.
    const paragraphStart = new vscode.Position(startLine, 0);
    const paragraphEnd = new vscode.Position(endLine, endCol);
    const paragraphRange = new vscode.Range(paragraphStart, paragraphEnd);

    // Get the original text.
    const paragraph = editor.document.getText(paragraphRange);

    // Justify the original text.
    const justifiedText = justify(paragraph, n);

    editor.edit((editBuilder) => {
        editBuilder.replace(paragraphRange, justifiedText);
    });
}

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext) {
    // Wrapper to register commands without repeating code.
    function registerCommand(cmd: string, callback: callback) {
        // Actual callback.
        const cmdCallback = () => {
            const editor = vscode.window.activeTextEditor;

            // Only makes the call if there is an active editor.
            if (editor) {
                // Get document language.
                const languageId = editor.document.languageId;

                // Get global and language-specific configuration.
                const langConfig = vscode.workspace.getConfiguration(`[${languageId}]`);
                const config = vscode.workspace.getConfiguration();

                // Attempt to get language-overridable setting.
                let lineWidth  = langConfig['justify.defaultLineWidth'];
                if (! lineWidth) {
                    // Fall back to global setting.
                    lineWidth = config.get('justify.defaultLineWidth');
                }
                if (! lineWidth) {
                    // Fall back to reasonable default value.
                    lineWidth = 80;
                }

                // Call the justify callback.
                callback(editor, lineWidth);
            }
        };

        // Register cmd.
        const disposable = vscode.commands.registerCommand(cmd, cmdCallback);
        context.subscriptions.push(disposable);
    }

    // Prompt for a value using functional programming.
    function promptForValue(callback: callback): callback {
        return async function(editor: vscode.TextEditor) {
            const minValue = 10;
            let value : any = await vscode.window.showInputBox({
                prompt: "Enter desire line width",
                placeHolder: "80",
            });
            callback(editor, Math.max(minValue, Number(value)));
        };
    }

    // Commands to be registered.
    const commands = [
        ["justify.justifySelection", justifySelection],
        ["justify.justifyFile", justifyFile],
        ["justify.justifyLine", justifyLine],
        ["justify.justifyParagraph", justifyParagraph],
    ];

    for (let command of commands) {
        let commandName = command[0] as string;
        let commandCallback = command[1] as callback;
        registerCommand(commandName, commandCallback);

        // Register the same command, but it will prompt the user for the value.
        commandName = commandName + 'WithPrompt';
        registerCommand(commandName, promptForValue(commandCallback));
    }
}

function findParagraphStart(editor: vscode.TextEditor, line: number): number {
    while (line > 0 && !editor.document.lineAt(line - 1).isEmptyOrWhitespace) {
        line--;
    }
    return line;
}

function findParagraphEnd(editor: vscode.TextEditor, line: number): number {
    const lastLine = editor.document.lineCount - 1;
    while (line < lastLine && !editor.document.lineAt(line + 1).isEmptyOrWhitespace) {
        line++;
    }
    return line;
}

// This method is called when your extension is deactivated
export function deactivate() {}
