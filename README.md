# SOLEN — Architectural Furniture & 3D Showroom

An interactive architectural furniture showroom and e-commerce experience built with **React**, **TypeScript**, **Three.js**, **GSAP ScrollTrigger**, **Motion**, and **Tailwind CSS**, paired with a **Node.js / Express** backend for aspect-ratio-controlled image generation and photo-to-video animation via the Gemini Interactions API (`@google/genai`).

## Features

- **Persistent 3D Architectural Showroom**: Continuous GSAP scroll-driven camera journey through Living Salon, Dining Pavilion, and Bedroom Sanctuary wings with procedural PBR oak, Roman travertine, limewash plaster, and woven fabric textures.
- **Live 3D Material & Colour Customization**: Real-time upholstery (`Bouclé`, `Natural Linen`, `Brushed Wool`, `Velvet`, `Premium Leather`), colour swatch, wood plinth, and modular size updates directly on 3D furniture assemblies.
- **Interactive Spaces & 360° Product Configurator**: Orbit, zoom, inspect, switch Salon/Atelier room arrangements, click pieces in 3D via raycasting, and configure any catalog piece in a dedicated 3D studio stage.
- **Full E-Commerce Flow**: Catalog filtering & sorting, search overlay, persistent wishlist, account order history, shopping bag drawer, and a 5-step validated checkout flow.
- **Studio AI Media Tools**: Server-side Gemini endpoints (`/api/gemini/generate-image` and `/api/gemini/animate-video`) supporting aspect-ratio image generation (`1:1` to `21:9`) and photo-to-video animation (`16:9` / `9:16`).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` (required only for the AI Studio image/video generation endpoints):
   ```bash
   cp .env.example .env
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app and API server run on `http://localhost:3000`.

4. **Type-check, unit-test, and build**
   ```bash
   npm run lint
   npx tsx --test src/utils/commerce.test.ts
   npm run build
   ```
