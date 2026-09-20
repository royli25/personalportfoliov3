/**
 * BlueprintX recording shell — dev-only, not part of the Next build.
 *
 * The demo is and stays a web component (it has to be — the portfolio embeds
 * it). This shell exists purely so Screen Studio can record a real macOS
 * window: frameless, aspect-locked to the 1440×900 canvas, with the system's
 * own corner rounding and shadow, and none of a browser's chrome. The mock
 * draws its own traffic lights, so the window draws none.
 *
 * Usage:  npm run dev    (one terminal)
 *         npm run shell  (another)
 *
 * One demo, one route — you move between screens through the product's own
 * sidebar. Override the target with DEMO_URL only if you add another demo.
 */
const { app, BrowserWindow } = require("electron");

const WIDTH = 1440;
const HEIGHT = 900;
const URL = process.env.DEMO_URL ?? "http://localhost:3000/demo/blueprintx";

/**
 * Next's dev server 404s while it restarts (editing next.config.ts does it),
 * and a frameless window has no address bar to retry from — you'd just be
 * staring at a 404 with no way back. So poll until the route is actually
 * ready, then load once.
 */
async function waitForRoute(url, timeoutMs = 60000) {
  const started = Date.now();
  for (;;) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return true;
    } catch {
      // server not up yet
    }
    if (Date.now() - started > timeoutMs) return false;
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function createWindow() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    useContentSize: true, // inner size = canvas size, exactly
    frame: false, // the mock supplies its own traffic lights
    resizable: true,
    backgroundColor: "#1a1a1a",
    show: false, // don't flash an empty frame while we wait
    // macOS keeps rounded corners + system shadow on frameless windows,
    // which is precisely the "real desktop app" read the recording needs.
  });

  // Resizing keeps the canvas aspect, and the page scales the demo to fit —
  // so any window size still shows the whole product, edge to edge.
  win.setAspectRatio(WIDTH / HEIGHT);

  const ready = await waitForRoute(URL);
  if (!ready) {
    console.error(
      `\n  Could not reach ${URL}\n  Is the dev server running?  npm run dev\n`,
    );
  }

  await win.loadURL(URL);
  win.show();
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => app.quit());
