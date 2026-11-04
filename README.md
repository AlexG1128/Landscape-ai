# 🌿 Landscape AI

Point your phone at your front or back yard and get **AI-powered landscaping suggestions** — a redesigned vision of the space, a curated list of plants/flowers/trees that will thrive there, and **where to buy them** at nearby stores.

> **Status:** MVP scaffold. Runs end-to-end out of the box using **mock AI responses**, so you can see the full experience immediately. Drop in real API keys to "light it up" with live AI and live store data — no code changes required.

---

## ✨ Features

| Feature | How it works | MVP status |
|---|---|---|
| 📸 **Yard capture** | Take/upload a photo in the app | ✅ Built |
| 🤖 **AI suggestions** | Photo + location → recommended plants with reasons | ✅ Built (mock; swappable for real model) |
| 🖼️ **Visual redesign** | Photo → AI-generated "after" image | ✅ Built (mock; swappable for real model) |
| 🌱 **Plant catalog** | Browse plants, flowers, vegetables, trees, seeds | ✅ Built (curated catalog) |
| 📍 **Hardiness zone** | Location → USDA zone → smarter picks | ✅ Built |
| 🛒 **Where to buy** | Nearby stores via Google Places + retailer deep links | ✅ Built (mock; swappable for real Google Places key) |

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
AI_PROVIDER=mock                        # mock | (add your own, e.g. "gemini")
AI_API_KEY=your_key_here
```

Then restart the backend. The app automatically uses real data wherever a key is present and falls back to mocks where it isn't.

---

## 🗺️ Roadmap (post-MVP)
- Real image-to-image redesign model integration
- Save/compare before & after designs
- Plant care reminders & seasonal planting calendar
- Retailer affiliate links (earn on purchases)
- Android support

---

## 📄 License
MIT (see `LICENSE`).
