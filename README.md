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
<img width="1260" height="1007" alt="Screenshot 2026-09-29 at 09 59 48" src="https://github.com/user-attachments/assets/ea58bb77-009a-4302-ac45-19698addbbc5" />

4. **Select local folder**:
   * Prequisites: the repo should be named as "bestiot.net:41030" and be a direct subfolder of the current folder (i.e. `[parent-folder]/bestiot.net:41030`).
   * Click **+ Select folder for overrides**.
   * Select this project parent folder (`[parent-folder]/bestiot.net:41030`).
<img width="612" height="263" alt="Screenshot 2026-09-29 at 10 07 36" src="https://github.com/user-attachments/assets/8fb65bb6-fbae-4310-b32d-5f88c31f4ba7" />

   * When Chrome shows a permission banner at the top, click **Allow**.
<img width="476" height="184" alt="Screenshot 2026-09-29 at 10 08 21" src="https://github.com/user-attachments/assets/42f4f67d-be1a-46a1-aaee-e4c36378f508" />
  

5. **Enable Overrides & Reload**:
   * Ensure the **Enable Local Overrides** checkbox is checked.
<img width="359" height="353" alt="Screenshot 2026-09-29 at 10 10 42" src="https://github.com/user-attachments/assets/408bc194-4d3b-48cc-82d0-b22fe0a5bffc" />


   * Reload the page (`Cmd + R` or `Ctrl + R`).
   * The browser will now serve your local files (`html`, `css`, `js`) instead of the remote assets, allowing you to preview and interact with the enhanced UI in real-time with live backend data.
<img width="1073" height="977" alt="Screenshot 2026-09-29 at 10 12 11" src="https://github.com/user-attachments/assets/c9e65da7-a32d-4f37-b359-fc6b4fd7fcab" />
  


---

## 3. Deployment
How to deploy the new UI on the site:

* **Overwrite existing files**: Overwrite all folders—`html/`, `css/` (within `html/css/`), and `js/`—over the existing files in the target repository or server.
* **NOTE (Filename matching)**: All file and folder names **must match the existing names exactly** (case-sensitive) so that embedded server paths, backend endpoints, and script references remain fully functional.
* **Verify**: Perform a hard refresh (`Cmd + Shift + R` / `Ctrl + F5`) in the browser after deployment to clear cached assets.
