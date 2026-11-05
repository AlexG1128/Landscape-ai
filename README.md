# 🌿 Landscape AI

Point your phone at your front or back yard and get **AI-powered landscaping suggestions** — a redesigned vision of the space, a curated list of plants/flowers/trees that will thrive there, and **where to buy them** at nearby stores.

> **Status:** MVP scaffold. Runs end-to-end out of the box using **mock AI responses**, so you can see the full experience immediately. Drop in real API keys to "light it up" with live AI and live store data — no code changes required.

---

## ✨ Features

| Feature | How it works | MVP status |
|---|---|---|
| 📸 **Yard capture** | Add a photo + an optional note describing what you want | ✅ Built |
| 🤖 **AI suggestions** | Photo + note + location → recommended plants with reasons | ✅ Built (mock; swappable for real model) |
| 🖼️ **Visual redesign** | Photo → AI-generated "after" image with a **before/after slider** | ✅ Built (mock; real via Gemini) |
| 🌱 **Plant catalog** | Browse 69 plants with imagery — flowers, shrubs, trees, veg, herbs, groundcovers, grasses, seeds | ✅ Built (curated catalog) |
| 🗂️ **History & folders** | Saved designs organized into folders (Front Yard, Back Yard, custom) | ✅ Built (stored on-device) |
| 📍 **Hardiness zone** | Location → USDA zone → smarter picks | ✅ Built |
| 🛒 **Where to buy** | Nearby stores via Google Places + retailer deep links | ✅ Built (mock; swappable for real Google Places key) |

### UI
Elegant, modern design with a hero home screen, **bottom tab navigation** (Home · Catalog · Stores · History), illustrated plant imagery, and a draggable before/after redesign reveal.

---

## 🏗️ Architecture

```
landscape-ai/
├── backend/     Node + TypeScript (Fastify) API  — keeps API keys secret, calls AI + Google Places
└── mobile/      React Native + Expo (TypeScript)  — iOS app (also runs in web/simulator for dev)
```

The app talks only to **your backend**. The backend talks to external services (AI provider, Google Places). This keeps secret keys off the device — the secure, correct pattern.

```
 iOS app  ──HTTPS──▶  backend  ──▶  AI vision/image model
                              └──▶  Google Places API
```

### The swappable AI layer

The backend defines a clean `AIProvider` interface (`backend/src/services/ai/`). The default is `MockAIProvider` (returns sample data so everything runs offline). When you have a real provider key, add a new provider class that implements the same interface and set `AI_PROVIDER=<name>` in `.env` — nothing else changes.

---

## 🚀 Quick start (on your Mac)

### Prerequisites
- **macOS** with **Node.js 18+** (`node --version`)
- **Xcode** (for the iOS simulator) and/or the **Expo Go** app on your iPhone
- Free [Expo account](https://expo.dev/) (optional but handy)

### 1. Backend
```bash
cd backend
cp .env.example .env     # fill in keys later; works with mocks as-is
npm install
npm run dev              # starts API on http://localhost:3000
```

### 2. Mobile app
```bash
cd mobile
npm install
npm start                # opens Expo; press "i" for iOS simulator, or scan QR with Expo Go on your iPhone
```

> **Testing on a physical iPhone?** Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your Mac's LAN IP (e.g. `http://192.168.1.20:3000`) so the phone can reach the backend. `localhost` only works in the simulator.

---

## 🔑 Making it "real" (adding keys)

Everything runs with mocks by default. To enable live features, edit `backend/.env`:

```env
# --- Google Places (nearby stores) ---
GOOGLE_PLACES_API_KEY=your_key_here     # https://developers.google.com/maps/documentation/places/web-service

# --- AI provider (yard analysis + redesign) ---
AI_PROVIDER=gemini                      # mock | gemini
AI_API_KEY=your_gemini_key_here         # https://aistudio.google.com/  ("Get API key")
```

Then restart the backend. The app automatically uses real data wherever a key is present and falls back to mocks where it isn't.

### How the real AI (Gemini) works
With `AI_PROVIDER=gemini`, the backend makes two calls to Google Gemini for each yard photo:
1. **`gemini-2.5-flash` (vision)** reads the photo and returns structured JSON — detected features, sun exposure, and 4–6 plant picks chosen from the app's catalog, each with a reason and placement.
2. **`gemini-2.5-flash-image` (image editing)** takes your actual photo and redesigns it in place — keeping your house and perspective while adding the landscaping — and returns the new image.

If either Gemini call fails (bad key, quota, network), the backend automatically falls back to mock output so the app never breaks.

---

## 🖼️ Generating real plant photos (optional)

The catalog ships with **real free photos** from Wikimedia Commons for 68 of the 69 plants (the rest fall back to elegant generated illustrations). No key or setup required.

Image priority per plant: your generated photo (below) → free Wikimedia photo → illustration.

To replace them with **your own AI-generated photos** using your Gemini key, run the generator on your Mac:

```bash
cd backend
# Cheap test run — just the first 3 plants:
AI_API_KEY=your_gemini_key LIMIT=3 npx tsx scripts/generate-plant-images.ts
# Or a single plant by name:
AI_API_KEY=your_gemini_key ONLY=rose npx tsx scripts/generate-plant-images.ts
# All 69:
AI_API_KEY=your_gemini_key npx tsx scripts/generate-plant-images.ts
```

Images are saved to `backend/src/data/plant-images.json` and are served automatically — restart the backend to see them. Re-running skips plants that already have an image, so it's safe to resume.

> ⚠️ This uses the **paid Gemini image model** (the free tier limit is 0), so each image incurs a small cost. Start with `LIMIT=3` to confirm quality and billing before generating all 69. Any plant without a generated photo keeps its illustration.

## 🗺️ Roadmap (post-MVP)
- Real image-to-image redesign model integration
- Save/compare before & after designs
- Plant care reminders & seasonal planting calendar
- Retailer affiliate links (earn on purchases)
- Android support

---

## 📄 License
MIT (see `LICENSE`).
