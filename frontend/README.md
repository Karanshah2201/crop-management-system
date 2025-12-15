# 🌾 Smart Farm Frontend

This is the frontend client for the **Smart Farm Management System**, built with [React.js](https://reactjs.org/) and styled using [TailwindCSS](https://tailwindcss.com/) in a premium "Glassmorphism" design.

## ✨ Features
*   **Modern UI**: Dark/Glass aesthetic with visual data representation.
*   **Interactive Forms**: Real-time validation for soil and weather input.
*   **Data Visualization**: Progress bars for prediction confidence.
*   **History Dashboard**: Displays recent prediction data fetched from the backend.
*   **Responsive**: Optimized for all device sizes.

## 🛠️ Tech Stack
*   **React** (v18+)
*   **TailwindCSS** (v3)
*   **Axios** (for API communication)
*   **React Scripts** (CRA)

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v14+) installed.

### 2. Install Dependencies
In the `frontend` directory, run:
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```
This runs the app in development mode on [http://localhost:3000](http://localhost:3000).
The page will reload if you make edits.

### 4. Build for Production
```bash
npm run build
```
Builds the app to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## 📁 Project Structure
*   `src/components/CropForm.jsx`: Main form handling predictions, fertilizer calc, and history display.
*   `src/App.js`: Main layout wrapper with the glassmorphism background and header/footer.
*   `src/index.css`: Global styles and Tailwind imports.
*   `tailwind.config.js`: Tailwind configuration for colors and plugins.

## 🔌 Backend Connection
This frontend expects the backend API to be running at `http://127.0.0.1:5000`.
Ensure you start the backend before testing predictions.
