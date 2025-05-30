
# ToyGrid Troubleshooting Guide

This document covers common issues and solutions for getting ToyGrid running locally with a Yjs WebSocket backend.

---

## Frontend Does Not Load

**Symptom**: You run `npm start` in `editor/` but nothing shows up at http://localhost:3000

**Checklist**:
- Make sure the terminal says `Compiled successfully!`
- Open a browser manually and go to http://localhost:3000
- Run `lsof -i :3000` to confirm something is listening
- If nothing is listening, restart the frontend

---

## Cannot Connect to WebSocket

**Symptom**: The app loads but does not sync or shows WebSocket connection errors

**Checklist**:
- Ensure the Yjs server is running in a separate terminal:
  ```bash
  PORT=1234 node server.js
  ```
- Make sure the URL matches in the frontend:
  ```bash
  REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234
  ```
- Verify port 1234 is listening:
  ```bash
  lsof -i :1234
  ```

---

## Port Already in Use

**Symptom**: You see an error that port 3000 or 1234 is already in use

**Solution**:
- Find and kill the process:
  ```bash
  fuser -k 3000/tcp
  fuser -k 1234/tcp
  ```

---

## Frontend Fails to Compile

**Symptom**: You run `npm start` and see red errors in the terminal

**Checklist**:
- Run `npm install` again in the `editor/` folder
- Make sure you are using a supported Node.js version (v18+ recommended)
- Check for typos in `.env` if you're using one

---

## WebSocket Server Crashes on Start

**Symptom**: You run `node server.js` and it immediately exits or shows `MODULE_NOT_FOUND`

**Solution**:
- Ensure all required packages are installed:
  ```bash
  npm install ws yjs y-protocols lib0
  ```
- Verify `lib/utils.js` exists and is being imported correctly
- Check the spelling and path in `server.js`:
  ```js
  const { setupWSConnection } = require('./lib/utils.js');
  ```

---

## Sync Works in One Tab but Not in Another

**Symptom**: You open two browser tabs but they don’t sync

**Checklist**:
- Confirm both tabs are open to the exact same URL (including document name)
- Check the WebSocket server terminal for errors
- Refresh both tabs and retry

---

## Still Stuck?

If everything above checks out but it still doesn't work:
- Reboot your machine
- Delete `node_modules/` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

If needed, reset your environment and walk through the setup guide again from `TOYGRID_SETUP.md`.

