# Technical Documentation & Code Structure

This document outlines the architecture, data flow, and component structure of the personal portfolio website.

## 🛠 Tech Stack

*   **Framework:** React 19 (Client-side rendering).
*   **Routing:** `react-router-dom` (HashRouter used for GitHub Pages compatibility).
*   **Styling:** Tailwind CSS (CDN-based for simplicity/portability).
*   **Math Rendering:** `react-markdown`, `remark-math`, `rehype-katex` (KaTeX).
*   **Icons:** `lucide-react`.
*   **CMS:** Python (`tkinter` + `json`).

## 📂 File Structure

```text
/
├── index.html            # Entry point, Tailwind config, Fonts
├── index.tsx             # React Root
├── App.tsx               # Main Layout & Routing
├── types.ts              # TypeScript Interfaces (Paper, Project, Profile, etc.)
├── constants.tsx         # Data Aggregator (Imports data.ts)
├── data.ts               # Generated Data File (Do not edit manually)
├── data.json             # Source Data File for CMS
├── cms.py                # Python GUI for editing data.json -> data.ts
├── components/
│   ├── Sidebar.tsx       # Responsive Navigation Sidebar
│   └── MarkdownRenderer.tsx # Renders MD + Math
├── pages/
│   ├── Home.tsx          # Bento Grid / Dashboard
│   ├── Research.tsx      # Academic Paper List
│   ├── Projects.tsx      # Masonry/Grid Project Cards
│   └── Garden.tsx        # Blog System (Async Markdown Loader)
└── posts/                # Directory for Markdown blog files
    └── *.md
```

## 🔄 Data Architecture

The application uses a **"Disconnected CMS"** pattern to allow dynamic editing without a database.

1.  **Source of Truth:** `data.json`. This file holds the raw strings, arrays, and paths.
2.  **The Editor:** `cms.py` reads `data.json`, presents a GUI, and modifies it.
3.  **The Bridge:** When `cms.py` saves, it writes to `data.json` AND generates `data.ts`.
    *   *Why?* Browsers/ES Modules often block importing `.json` files directly without specific bundler configs. Generating a `.ts` file that `export default {...}` ensures universal compatibility.
4.  **The Consumer:** `constants.tsx` imports `data.ts` and maps it to strongly typed interfaces defined in `types.ts`.
5.  **The View:** React components import constants to render content.

## 🧩 Key Components

### `MarkdownRenderer.tsx`
A wrapper around `react-markdown`.
*   **Plugins:** `remark-math` (parses math), `rehype-katex` (renders math).
*   **Styling:** Uses Tailwind's `@tailwindcss/typography` (prose) equivalent classes manually applied to mapped components (`h1`, `p`, `blockquote`, `code`).

### `pages/Garden.tsx`
Handles the dual state of "List View" vs "Post View".
*   **Async Loading:** If a post's `content` field ends in `.md` or starts with `/`, it triggers a `fetch()` request to load the raw text file.
*   **Fallback:** If the content is simple text, it renders immediately.

### `cms.py`
A standalone Python script using `tkinter`.
*   **Robustness:** Handles missing keys gracefully.
*   **Tabs:** Home & Hero, Homepage, Profile, Research, Projects, Garden, File Manager, **Tag Manager (New)**, Post Editor.
*   **Typography & Content Controls:**
    *   **Home & Hero:** Exposes dual font selectors and size class overrides for headline/subheadline.
    *   **Homepage:** Allows editing the "Projects" card text (e.g., "Fun projects that I do").
    *   **Research Tab:** Includes a top-level "Page Settings" text area to edit the Research page introduction text.
*   **Tag Manager:** A centralized list of tags (global) that can be selected via a multi-select dialog in paper, project, and post forms. This prevents typos and ensures tag consistency.
*   **IO:** Writes UTF-8 encoded files.

## 🎨 Design System

The design follows a "Swiss Style / Academic" aesthetic.
*   **Typography:** High contrast. Large Serif headers (Cinzel) paired with clean Serif/Sans body (Palatino).
*   **Layout:**
    *   **Desktop:** Fixed left sidebar (320px), scrollable main content.
    *   **Mobile:** Fixed top header, collapsible sidebar menu.
*   **Responsiveness:**
    *   `Home.tsx` uses complex grid logic (`col-span-12`, `lg:col-span-8`) to create the Bento layout.
    *   Specific attention paid to `flex-col` vs `flex-row` switching on the "Featured" card for tablet breakpoints.

## ⚠️ Maintenance Notes

1.  **Race Conditions:** There are none, as this is a static site.
2.  **Images:** Currently assumes external URLs (e.g., `picsum.photos` or hosted assets). If local images are needed, they should be placed in an `assets/` folder and referenced relatively.
3.  **PDFs:** Linked via the CMS. For GitHub Pages, ensure PDFs are in the `public` or root directory so relative paths work.
