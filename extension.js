const vscode = require("vscode");
const path = require("path");

function activate(context) {
  console.log(
    'Congratulations, your extension "live-preview-desktop-and-mobile" is now active!'
  );

  let previewPanel = undefined;

  function getWebviewContent() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === "html") {
      const text = editor.document.getText();
      const uri = editor.document.uri;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

      const replacedText = text
        .replace(/(<link.+href=")(.+?)"/g, (_, p1, p2) => {
          const filePath = path.join(workspaceFolder.uri.fsPath, p2);
          const fileUri = vscode.Uri.file(filePath);
          const webviewUri = previewPanel.webview.asWebviewUri(fileUri);
          return `${p1}${webviewUri.toString()}"`;
        })
        .replace(/(<script.+src=")(.+?)"/g, (_, p1, p2) => {
          const filePath = path.join(workspaceFolder.uri.fsPath, p2);
          const fileUri = vscode.Uri.file(filePath);
          const webviewUri = previewPanel.webview.asWebviewUri(fileUri);
          const scriptUri = webviewUri.toString();
          return `${p1}${scriptUri}"`;
        })
        .replace(/(<img.+src=")(.+?)"/g, (_, p1, p2) => {
          const filePath = path.join(workspaceFolder.uri.fsPath, p2);
          const fileUri = vscode.Uri.file(filePath);
          const webviewUri = previewPanel.webview.asWebviewUri(fileUri);
          return `${p1}${webviewUri.toString()}"`;
        });

      return `
      <div class="wrapper">
      <h1>Desktop</h1>
        <div class="desktop">
        
          <div class="content">${replacedText}</div>
        </div>
        <h1>Mobile</h1>
        <div class="portrait">
          
          <div class="content">${replacedText}</div>
        </div>
      
        <div class="landscape">
         
          <div class="content">${replacedText}</div>
        </div>
      </div>
      <style>
        body,html{
          background:transparent;
          background-image:linear-gradient(transparent,transparent);
          background-color: transparent;
          display:flex;
          opacity:1;
          height:100%;
          width:100%;
          overflow: auto;
    
        }
        .wrapper {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
        }
    
        .desktop {
          top:20px;
          width: 600px;
          height: 500px;
          margin-right: 20px;
          border: 1px solid gray;
        }

       
        .portrait {
          width: 250px;
          height: 350px;
          top:650px;
          margin-right: 20px;
          border: 1px solid gray;
        }
      
        .landscape {
          width: 400px;
          height: 300px;
          top:1120px;
          border: 1px solid gray;
        }
        
        .content {
          height: 100%;
          width: 100%;
          position: relative;
        }
  
        .content > * {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
    
      </style>
      
  
     
    `;
    }
    return "No HTML content found in active editor.";
  }

  // Register the "live-preview.openPreview" command
  let openPreviewDisposable = vscode.commands.registerCommand(
    "live-preview.openPreview",
    () => {
      if (!previewPanel) {
        // Create the preview panel if it doesn't exist
        previewPanel = vscode.window.createWebviewPanel(
          "livePreview", // Identifies the panel
          "Live Preview", // Title of the panel
          vscode.ViewColumn.Beside, // Editor column to show the panel in
          { enableScripts: true } // Enable JavaScript in the panel
        );

        previewPanel.onDidDispose(() => {
          previewPanel = undefined;
        });
      }

      previewPanel.webview.html = getWebviewContent();
    }
  );

  context.subscriptions.push(openPreviewDisposable);

  // Register the "live-preview.refreshPreview" command
  let refreshPreviewDisposable = vscode.commands.registerCommand(
    "live-preview.refreshPreview",
    () => {
      if (previewPanel) {
        previewPanel.webview.html = getWebviewContent();
      }
    }
  );

  context.subscriptions.push(refreshPreviewDisposable);

  // Register the "live-preview.showPreviewButton" command
  let showButtonDisposable = vscode.commands.registerCommand(
    "live-preview.showPreviewButton",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const uri = editor.document.uri;
        vscode.commands.executeCommand(
          "setContext",
          "live-preview:showPreviewButton",
          true
        );
      }
    }
  );

  context.subscriptions.push(showButtonDisposable);

  // Create the toolbar button
  let toolbarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  toolbarButton.text = "$(preview) Show Live Preview";
  toolbarButton.tooltip = "Show Live Preview";
  toolbarButton.command = "live-preview.openPreview";
  toolbarButton.show();

  // Create the refresh button and add it to the toolbar
  let refreshButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    99
  );

  refreshButton.text = "$(sync) Refresh Live Preview";
  refreshButton.tooltip = "Refresh Live Preview";
  refreshButton.command = "live-preview.refreshPreview";
  refreshButton.show();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
