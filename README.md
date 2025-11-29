# Personal Academic Portfolio

A minimal, stylized academic portfolio website designed for researchers. It features a modular "bento-box" layout, Markdown rendering for blog posts with math support, and a Python-based Content Management System (CMS) for easy updates.

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Local Server:**
    ```bash
    npm start
    ```
    Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

3.  **Edit Content:**
    Run the included Python CMS to visually edit your profile, papers, and projects.
    ```bash
    python cms.py
    ```

---

## 📝 How to Update Content

This website uses a **Hybrid Workflow**:

### 1. Updating Lists (Papers, Projects, Profile Info)
Use the Python GUI. This is the safest and easiest way.

1.  Run `python cms.py`.
2.  Navigate tabs (Profile, Research, Projects, Garden).
3.  Add/Edit/Remove items.
4.  **Important:** Click **"SAVE ALL CHANGES"** at the bottom.
    *   *Technical Note:* This updates `data.json` (for the CMS) and auto-generates `data.ts` (for the React app).

### 2. Writing Blog Posts ("The Garden")
1.  Create a new Markdown file in the `posts/` directory (e.g., `posts/my-new-theory.md`).
2.  Write your content using standard Markdown. You can use LaTeX math syntax (e.g., `$$ E=mc^2 $$`) thanks to KaTeX support.
3.  Open `cms.py`, go to the **Garden** tab, and create a new entry.
4.  In the "Content" field, type the path to your file: `posts/my-new-theory.md`.

### 3. Updating Static Text (Headings & Intros)
Most static text is now editable via the CMS:

*   **Homepage Cards:** The "Projects" card text can be edited in the **Homepage** tab.
*   **Page Introductions:** The Research page introduction text can be edited in the **Research** tab ("Page Settings" section at the top).
*   **Hero Section:** The headline and subheadline are maintained in the **Home & Hero** tab.
*   **CV Link:** Update the "Curriculum Vitae" path in the **Profile** tab to link the sidebar button to a PDF in your uploads folder.

### 4. Managing Tags
Instead of typing tags manually for every entry, use the **Tag Manager**:
1.  Go to the **Tag Manager** tab in `cms.py`.
2.  Add new global tags (e.g., "Quantum Computing", "Python").
3.  In the Research, Projects, or Post Editor tabs, click **Select...** next to the "Tags" field.
4.  Check the boxes for the tags you want to apply and click OK.

---

## 🎨 Customization

*   **Styles:** Tailwind CSS is used for styling. Configuration is in `index.html`.
*   **Fonts:**
    *   **Headings:** *Cinzel* (Google Fonts) - A serif font inspired by Roman inscriptions.
    *   **Body:** *Palatino Linotype* - A classic, readable serif font.
*   **Colors:** Defined in `tailwind.config` inside `index.html`:
    *   `academic-orange`: #be5d36
    *   `academic-black`: #0d0d0d
    *   `academic-cream`: #f2f0e9
*   **Hero Typography Controls:** The Home tab in `cms.py` exposes dual font selectors for English and Chinese headline/subheadline typography, plus Tailwind size overrides. Adjust the controls there rather than editing the component directly.

## 📦 Deployment (GitHub Pages)

This project is set up for GitHub Pages.

1.  Commit your changes:
    ```bash
    git add .
    git commit -m "Update portfolio"
    git push origin main
    ```
2.  Ensure your repository settings has GitHub Pages enabled (Source: `root` or `docs` depending on your build setup, usually `main` branch for this simple setup).
