# PWA-README
This document describes the process of creating a Progressive Web App (PWA) for a web application and how to maintain and update it.

## 1. Initial Setup
**1. Basic PWA Requirements:**

- Added a `manifest.json` to define the app's metadata (e.g., name, icons, theme color).
- Served the app using a local server for development (e.g., http-server).

**2. Service Worker Setup:**

- Used `Workbox` to handle caching and offline functionality.
- Configured Workbox with strategies like NetworkFirst for JSON files and static resources.

## 2. Building the Service Worker
**1. Workbox Configuration:**

- Defined `workbox-config.js` to specify:
    - ~~Which files to precache (`globPatterns`).~~
    - Source (`src/sw-src.js`) and destination (`docs/sw.js`) of the SW.

**2. Service Worker Logic:**

- Precached assets using `precacheAndRoute`.
- Dynamically cached resources using `registerRoute` with strategies like `NetworkFirst`.
- Handled cleanup of old caches during the SW activation phase.

**3.Building the SW:**

- Used the Workbox CLI command:
```bash
npx workbox injectManifest src/workbox-config.js
```
- Added the Workbox CLI command in the package.json file scripts section:
```json 
"build-sw": "npx workbox injectManifest src/workbox-config.js"
```
- The built SW (`docs/sw.js`) is deployed alongside the app.

## 3. Testing Locally

**1. PWA Testing:**

- Used `localhost` and `chrome://inspect` to test the app on both desktop and Android devices.
    - Verified installability. Check under `Application` tab for:
        - `Manifest`
        - `Service Worker`
        - `Cache Storage`
    - Check under `Network` tab for:
        - Requests made by the SW
    - Check under `Console` tab for:
        - SW console log messages for Service worker registration issues or Errors in caching 
    - Test offline functionality
        - Under the `Network` tab, set the offline mode and check for requests made by the SW.
    - Test if updates are applied
        - Make a small change on any file and see if the change is reflected in the app.

**2. Mobile Testing:**
- Set `Android developer` options:
    - `Enable USB debugging`
- Connect your Android device to your computer over USB.
- Enable port forwarding on the computer. 
    - Go to `chrome://inspect/#devices` click on `Port forwarding` and add `localhost:3000` to the list.
    - Open address from mobile. 
    - You ca inspect the app on your mobile using `chrome://inspect/#devices` 

## 4. Maintaining and Updating

**1. Building the SW After Changes:**
- Rebuild the SW with:
```bash
npm run build-sw
```

- Testing Updates


