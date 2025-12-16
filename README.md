# Namma Daari (ನಮ್ಮ ದಾರಿ)

**Your personal guide to the safest streets in Bengaluru.**

Namma Daari ("Our Way" in Kannada) isn't just another map app. It's a specialized safety tool built specificially for Bengaluru, designed to help you navigate not just the fastest routes, but the *safest* ones.

Whether you're walking home late at night in Indiranagar or commuting through Silk Board, this app analyzes real-time data to keep you informed.

---

## 🛠️ How It Actually Works

Unlike standard maps that only minimize time, Namma Daari runs a custom **Safety Weighting Algorithm** on every possible route. Here's what happens under the hood when you search:

### 1. The Routing Engine (with Redundancy)
We don't rely on a single source of truth. The app uses a **fallback architecture**:
1.  **Primary**: It attempts to fetch routes from **OSRM (Open Source Routing Machine)**.
2.  **Backup**: If OSRM is overloaded or down, it seamlessly fails over to **TomTom's Routing API**.
3.  **Optimization**: We request multiple alternative routes (not just one) to compare their safety profiles.

### 2. The Safety Algorithm
Once we have the geometry of the route strings, we run them through `safetyService.js`. The logic calculates a **Safety Score (0-100)** based on four key factors:

*   **🚨 Crime Hotspots**: We map your route against a database of known high-severity zones (e.g., active incident areas in BTM, MG Road).
    *   *Logic*: `Quadratic Falloff`. If you are within 2km of a hotspot, the risk score spikes, but drops off sharply as you move away.
*   **⚠️ Accident Zones**: We track blackspots where frequent accidents occur.
    *   *Logic*: Weighted by severity (1.5x multiplier) within a 1km radius.
*   **👮 Police Protection**: Proximity to police stations acts as a safety "shield".
    *   *Logic*: Deducts up to 60% of the risk score if you are within 1.5km of a station.
*   **🏥 Medical Access**: Proximity to hospitals provides a secondary safety boost.
    *   *Logic*: Deducts up to 30% of risk if within 1km.

### 3. Real-World Adjustments (The "Bengaluru Factor")
Raw travel times are rarely accurate here. We apply a **1.4x congestion multiplier** by default to account for typical city traffic. On top of that, we overlay **Weather Data** (OpenWeatherMap)—if it's raining, we automatically add a 20% buffer to your ETA.

---

## 💻 Tech Stack & Performance

This is a modern, lightweight web application built for speed (high INP performance verified).

*   **Core**: Vanilla JavaScript (ES Modules) - no heavy framework bloat.
*   **Bundler**: **Vite** for lightning-fast HMR and optimized production builds.
*   **Maps**: **MapLibre GL JS** - Open-source, high-performance vector maps.
*   **Styling**: Pure CSS with glassmorphism effects (`backdrop-filter`) for that premium feel.

### Key Optimizations
*   **Mobile-First**: The bottom panel works like a native app sheet, with touch-drag gestures optimized for 60fps.
*   **Deferred Rendering**: Heavy map operations (like route painting) are deferred using `requestAnimationFrame` and `setTimeout` to ensure the UI never freezes, even on mid-range phones.

---

## 🚀 Features at a Glance

*   **Safe Route finding**: Color-coded routes (Green = Safe, Orange = Moderate, Red = Caution).
*   **Metro & BMTC Layers**: Toggle overlays to see Namma Metro stations and bus routes.
*   **SOS Button**: A quick-access emergency trigger.
*   **Traffic & Weather**: Live incident markers and current weather conditions affecting your trip.

---

## 🏃‍♂️ Running it Locally

You can run this on your machine in seconds:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the server**:
    ```bash
    npm run dev
    ```
    Typically runs at `http://localhost:5173` or `http://localhost:8080`.

3.  **Build for production**:
    ```bash
    npm run build
    ```

---

*Made with ❤️ for Namma Bengaluru.*
