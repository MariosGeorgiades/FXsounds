═══════════════════════════════════════════════════
  FX SOUND PRODUCTIONS — WEBSITE SETUP GUIDE
═══════════════════════════════════════════════════

FOLDER STRUCTURE:
  fx-website/
    index.html       ← main website page
    styles.css       ← all the styling
    scripts.js       ← all the functionality
    media.json       ← list of your photo/video filenames
    images/          ← ALL your photos and videos go here
      logo-full.jpg  ← full FX logo (already included)
      logo-badge.jpg ← round badge logo (already included)
    README.txt       ← this file

HOW TO ADD YOUR PHOTOS:
────────────────────────
1. Copy your photos/videos into the  images/  folder
   Example: wedding.jpg, concert.mp4, setup.jpg

2. Open  media.json  in Notepad or any text editor
   Add your filenames like this:
   [
     "wedding.jpg",
     "concert.mp4",
     "setup1.jpg",
     "setup2.jpg"
   ]

3. Save — done! Refresh the website to see your gallery.

UPDATE YOUR CONTACT DETAILS:
──────────────────────────────
Open index.html and search for:
  +357 XXXX XXXX              → replace with your phone
  info@fxsoundproductions.com → replace with your email

HOW TO VIEW LOCALLY:
──────────────────────
Option A — VS Code (free):
  Install "Live Server" extension
  Right-click index.html → Open with Live Server

Option B — Python:
  In Terminal/Command Prompt run:
    python -m http.server 8000
  Then open: http://localhost:8000

GO LIVE FOR FREE:
──────────────────
1. Go to app.netlify.com/drop
2. Drag the ENTIRE fx-website folder onto the page
3. Your site is live instantly!
4. To update: just drag the folder again

═══════════════════════════════════════════════════
