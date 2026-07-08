import puppeteer from "puppeteer-core";
const CHROME = "C:\Program Files\Google\Chrome\Application\chrome.exe";
const OUT = "C:\Users\DELL\Kingdom steward\web";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
for (const theme of ["dark", "light"]) {
  const p = await b.newPage();
  await p.evaluateOnNewDocument((t) => localStorage.setItem("theme", t), theme);
  await p.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 900));
  await p.screenshot({ path: `${OUT}\.land-${theme}.png` });
  await p.close();
}
await b.close(); console.log("done");
