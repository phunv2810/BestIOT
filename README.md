# BestIOT - UI Enhancement

## 1. Project Overview
* **UI Enhancement Only**: This project is strictly about enhancing the new UI to replace the old one.
* **Based on Public Source**: All source code is only HTML, CSS, Javascript extracted from the live site (`bestiot.net:41030`), not entire source.

---

## 2. Running & Preview Locally
We use the **Local Overrides** feature in Chromium-based browsers (Google Chrome, Microsoft Edge, etc.) to preview and test changes locally against the live site:

1. **Open the live site**: Navigate to `http://bestiot.net:41030` in your browser and login.
2. **Open Developer Tools**: Press `F12` (or `Cmd + Option + I` on macOS / `Ctrl + Shift + I` on Windows).
3. **Open the Overrides tab**:
   * Click on the **Sources** tab in DevTools.
   * Select the **Overrides** tab on the left-hand panel (click `»` if it's not visible).
4. **Select local folder**:
   * Prequisites: the repo should be named as "bestiot.net:41030" and be a direct subfolder of the current folder (i.e. `[parent-folder]/bestiot.net:41030`).
   * Click **+ Select folder for overrides**.
   * Select this project folder (`[parent-folder]/bestiot.net:41030`).
   * When Chrome shows a permission banner at the top, click **Allow**.
5. **Enable Overrides & Reload**:
   * Ensure the **Enable Local Overrides** checkbox is checked.
   * Reload the page (`Cmd + R` or `Ctrl + R`).
   * The browser will now serve your local files (`html`, `css`, `js`) instead of the remote assets, allowing you to preview and interact with the enhanced UI in real-time with live backend data.

---

## 3. Deployment
How to deploy the new UI on the site:

* **Overwrite existing files**: Overwrite all folders—`html/`, `css/` (within `html/css/`), and `js/`—over the existing files in the target repository or server.
* **NOTE (Filename matching)**: All file and folder names **must match the existing names exactly** (case-sensitive) so that embedded server paths, backend endpoints, and script references remain fully functional.
* **Verify**: Perform a hard refresh (`Cmd + Shift + R` / `Ctrl + F5`) in the browser after deployment to clear cached assets.
