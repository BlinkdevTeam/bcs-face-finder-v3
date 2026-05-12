const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile("dist/index.html");
}


app.whenReady().then(() => {

  const { execSync } = require("child_process");

  try {
    execSync("pkill -f run_backend");
  } catch (e) {}

  backendProcess = spawn(path.join(__dirname, "run_backend"), [], {
    shell: true,
  });

  console.log("Starting backend...");

  function checkOutput(data) {
    const output = data.toString();
    console.log(output);

    if (output.includes("Uvicorn running on")) {
      console.log("Backend ready. Opening window...");
      createWindow();
    }
  }

  backendProcess.stdout.on("data", checkOutput);
  backendProcess.stderr.on("data", checkOutput);
});





app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});
