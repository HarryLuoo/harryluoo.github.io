import json
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import webbrowser
import subprocess
import socket
import threading
import time
import os
import sys
import platform
import datetime
import re
import shutil

DATA_FILE = "data.json"
TS_FILE = "data.ts"
PREVIEW_URL = "http://localhost:8080"
PORT = 8080

class WebsiteCMS:
    def __init__(self, root):
        self.root = root
        self.root.title("Portfolio Website CMS")
        self.root.geometry("1100x850")
        
        # Load Data
        self.data = self.load_data()
        
        # UI Setup
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)
        
        # Tabs
        self.create_home_tab()
        self.create_homepage_tab()
        self.create_profile_tab()
        self.create_research_tab()
        self.create_projects_tab()
        self.create_garden_tab()
        self.create_file_manager_tab()
        self.create_tag_manager_tab()
        self.create_post_editor_tab()
        
        # Bottom Action Bar
        self.create_bottom_bar()

        # Check Environment on Startup
        self.check_environment()

    def check_environment(self):
        """Diagnose Node/NPM environment issues."""
        try:
            # 1. Check Node Version
            node_output = subprocess.check_output(["node", "-v"], text=True).strip()
            # output looks like "v18.16.0"
            match = re.search(r'v(\d+)\.', node_output)
            if match:
                major = int(match.group(1))
                if major < 16:
                    messagebox.showwarning(
                        "Node.js Version Warning", 
                        f"You are using Node.js {node_output}.\n"
                        "This website works best with Node.js v18 or v20 (LTS).\n"
                    )
            
            # 2. Check NPM path to detect 'Zombie Node' issues
            if platform.system() == "Windows":
                npm_where = subprocess.check_output(["where", "npm"], text=True).strip().split('\n')
                node_where = subprocess.check_output(["where", "node"], text=True).strip().split('\n')
                
                # If 'where node' returns a path different from NVM but NVM is installed, warn user
                if len(node_where) > 1 or ("nvm" in node_where[0].lower() and major > 22):
                     print(f"Debug: Node paths found: {node_where}")

        except Exception as e:
            # Node might not be in path
            print(f"Environment check failed: {e}")

    def create_bottom_bar(self):
        btn_frame = ttk.Frame(self.root)
        btn_frame.pack(side='bottom', fill='x', padx=10, pady=10)

        # Status Label
        self.status_label = ttk.Label(btn_frame, text="Ready", font=("Arial", 9, "italic"))
        self.status_label.pack(side='bottom', anchor='w', padx=5, pady=(5,0))

        # Open Preview Button
        self.preview_btn = ttk.Button(btn_frame, text="OPEN PREVIEW (Launch Server)", command=self.handle_preview)
        self.preview_btn.pack(side='left', fill='x', expand=True, padx=(0, 5))

        # Save Button
        save_btn = ttk.Button(btn_frame, text="SAVE ALL CHANGES", command=self.save_data)
        save_btn.pack(side='right', fill='x', expand=True, padx=(5, 0))

    # ==========================
    # SERVER & PREVIEW LOGIC
    # ==========================
    def handle_preview(self):
        self.preview_btn.config(state="disabled")
        self.update_status("Preparing preview...")
        threading.Thread(target=self.run_preview_workflow, daemon=True).start()

    def run_preview_workflow(self):
        try:
            cwd = os.getcwd()
            node_modules_path = os.path.join(cwd, "node_modules")
            if not os.path.isdir(node_modules_path):
                self.update_status("Installing dependencies (npm install)...")
                self.run_npm_command(["install"])
            self.update_status("Starting development server (npm start)...")
            self.run_npm_command(["start"], background=True)
            time.sleep(2)
            self.update_status("Opening preview in browser...")
            webbrowser.open(PREVIEW_URL)
        except subprocess.CalledProcessError as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Command failed: {e}"))
        except FileNotFoundError:
            self.root.after(0, lambda: messagebox.showerror("Error", "npm was not found in your PATH."))
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to open preview: {e}"))
        finally:
            self.update_status("Ready")
            self.root.after(0, self.reset_preview_btn)

    def run_npm_command(self, args, background=False):
        cwd = os.getcwd()
        system = platform.system()
        if system == "Windows":
            cmd = f'npm {" ".join(args)}'
            if background:
                return subprocess.Popen(cmd, shell=True, cwd=cwd)
            return subprocess.run(cmd, shell=True, check=True, cwd=cwd)
        else:
            cmd = ["npm", *args]
            if background:
                return subprocess.Popen(cmd, cwd=cwd)
            return subprocess.run(cmd, check=True, cwd=cwd)

    def update_status(self, message):
        self.root.after(0, lambda: self.status_label.config(text=message))

    def reset_preview_btn(self):
        self.preview_btn.config(state="normal")

    # ==========================
    # DATA HANDLING
    # ==========================
    def load_data(self):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            messagebox.showerror("Error", f"Could not find {DATA_FILE}")
            return {}

    def save_data(self):
        # 1. Save to JSON
        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save JSON: {e}")
            return

        # 2. Save to TS
        try:
            ts_content = f"const data = {json.dumps(self.data, indent=2)};\nexport default data;"
            with open(TS_FILE, 'w', encoding='utf-8') as f:
                f.write(ts_content)
            
            self.status_label.config(text="Changes saved successfully.")
            messagebox.showinfo("Success", "Website updated successfully!")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save TS: {e}")

    # ==========================
    # HELPER: SCROLLABLE FRAME
    # ==========================
    def create_scrollable_frame(self, parent):
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        return scrollable_frame

    # ==========================
    # TAB: HOME (HERO)
    # ==========================
    def create_home_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Home & Hero")
        
        frame = self.create_scrollable_frame(tab)
        
        if "hero" not in self.data:
            self.data["hero"] = {"headline": "", "subheadline": ""}
        
        hero_data = self.data["hero"]
        hero_defaults = {
            "headlineFontEng": "Cinzel",
            "headlineFontCn": "\"Noto Serif SC\"",
            "headlineSize": "text-5xl md:text-7xl lg:text-8xl",
            "subheadlineFontEng": "\"Palatino Linotype\"",
            "subheadlineFontCn": "\"Noto Serif SC\"",
            "subheadlineSize": "text-xl md:text-2xl lg:text-3xl"
        }
        for key, value in hero_defaults.items():
            hero_data.setdefault(key, value)
        
        ttk.Label(frame, text="Homepage Hero Section", font=("Arial", 14, "bold")).pack(pady=10, anchor='w')
        
        # Headline
        self.add_text_area(frame, "Headline (The Big Text)", hero_data, "headline", height=3)
        self.add_dual_font_controls(frame, hero_data, "Headline", "headline")

        # Subheadline
        self.add_text_area(frame, "Subheadline / Quote", hero_data, "subheadline", height=3)
        self.add_dual_font_controls(frame, hero_data, "Subheadline", "subheadline")
        
        ttk.Label(frame, text="Note: Use \\n for line breaks.", font=("Arial", 9, "italic")).pack(anchor='w', padx=5)

    def create_homepage_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Homepage")
        
        frame = self.create_scrollable_frame(tab)
        homepage_data = self.ensure_homepage_data()
        
        ttk.Label(frame, text="Homepage Settings", font=("Arial", 14, "bold")).pack(pady=10, anchor='w')
        self.add_entry(frame, "Browser Tab Title", homepage_data, "tabTitle")
        
        # projectsDescription
        self.add_entry(frame, "Projects Card Text", homepage_data, "projectsDescription")

        available_entries = self.build_homepage_source_entries()
        entry_map = {(entry["type"], entry["id"]): entry for entry in available_entries}

        def format_entry_label(key):
            entry = entry_map.get(key)
            if entry:
                return f"{entry['label']} [{entry['id']}]"
            return f"{key[0].capitalize()} - {key[1]}"

        available_labels = [format_entry_label((entry["type"], entry["id"])) for entry in available_entries]
        label_to_entry = {format_entry_label((entry["type"], entry["id"])): entry for entry in available_entries}

        recent_section = ttk.LabelFrame(frame, text="Recent Entries", padding=10)
        recent_section.pack(fill='both', pady=10, padx=5)

        recent_frame = ttk.Frame(recent_section)
        recent_frame.pack(fill='both', expand=True)

        self.manual_listbox = tk.Listbox(recent_frame, height=8)
        self.manual_listbox.pack(side='top', fill='both', expand=True)

        self.manual_form_frame = ttk.Frame(recent_frame)
        self.manual_form_frame.pack(fill='x', pady=5)

        self.homepage_data = homepage_data

        button_frame = ttk.Frame(recent_frame)
        button_frame.pack(fill='x')
        ttk.Button(button_frame, text="+ Add New", command=self.add_manual_entry).pack(side='left', padx=2)
        ttk.Button(button_frame, text="+ Edit Selected", command=self.on_manual_select).pack(side='left', padx=2)
        ttk.Button(button_frame, text="- Delete", command=self.remove_manual_entry).pack(side='left', padx=2)
        ttk.Button(button_frame, text="Move Up", command=lambda: self.move_manual_entry(-1)).pack(side='left', padx=2)
        ttk.Button(button_frame, text="Move Down", command=lambda: self.move_manual_entry(1)).pack(side='left', padx=2)

        self.manual_listbox.bind('<<ListboxSelect>>', self.on_manual_select)

        self.refresh_manual_list()

        featured_section = ttk.LabelFrame(frame, text="Featured Entry", padding=10)
        featured_section.pack(fill='x', pady=10, padx=5)

        if not available_entries:
            ttk.Label(featured_section, text="Add content entries to enable featured selection.").pack(anchor='w')
        else:
            ttk.Label(featured_section, text="Select the entry showcased prominently on the homepage.", font=("Arial", 10)).pack(anchor='w', pady=(0, 5))
            featured_var = tk.StringVar()
            featured_combo = ttk.Combobox(featured_section, values=available_labels, textvariable=featured_var, state="readonly")
            featured_combo.pack(fill='x', pady=5)

            current_featured = homepage_data.get("featuredEntry", {})
            current_key = (current_featured.get("type"), current_featured.get("id"))
            current_label = format_entry_label(current_key)
            if current_label not in available_labels and available_labels:
                fallback = available_entries[0]
                current_featured["type"] = fallback["type"]
                current_featured["id"] = fallback["id"]
                current_label = format_entry_label((fallback["type"], fallback["id"]))
            featured_var.set(current_label)

            def on_featured_change(*args):
                label = featured_var.get()
                selected = label_to_entry.get(label)
                if selected:
                    featured_entry = homepage_data.setdefault("featuredEntry", {})
                    featured_entry["type"] = selected["type"]
                    featured_entry["id"] = selected["id"]
            featured_var.trace_add("write", on_featured_change)

            self.add_entry(featured_section, "Featured Image Override (Optional)", homepage_data["featuredEntry"], "imageOverride")
    
    def ensure_homepage_data(self):
        if "homepage" not in self.data:
            self.data["homepage"] = {}
        homepage = self.data["homepage"]
        default_featured = self.get_default_featured_entry()
        homepage.setdefault("tabTitle", "Harry Luo | Researcher")
        homepage.setdefault("projectsDescription", "Fun projects that I do")
        homepage.setdefault("recentMode", "auto")
        homepage.setdefault("recentAutoLimit", 3)
        recent_entries = homepage.setdefault("recentManualEntries", [])
        # Migrate old entries...
        if "featuredEntry" not in homepage:
            homepage["featuredEntry"] = default_featured
        else:
            featured = homepage["featuredEntry"]
            featured.setdefault("type", default_featured.get("type", "project"))
            featured.setdefault("id", default_featured.get("id", ""))
            featured.setdefault("imageOverride", "")
            homepage["featuredEntry"] = featured
        return homepage

    def refresh_manual_list(self):
        self.manual_listbox.delete(0, tk.END)
        for entry in self.homepage_data["recentManualEntries"]:
            display = entry.get("title", "Untitled")
            self.manual_listbox.insert(tk.END, display)

    def add_manual_entry(self):
        new_item = {"title": "New Entry", "dateLabel": "", "description": "", "link": "", "ctaLabel": "", "imageUrl": ""}
        self.homepage_data["recentManualEntries"].append(new_item)
        self.refresh_manual_list()
        last_index = len(self.homepage_data["recentManualEntries"]) - 1
        self.manual_listbox.select_set(last_index)
        self.on_manual_select()

    def remove_manual_entry(self):
        selection = self.manual_listbox.curselection()
        if not selection:
            return
        del self.homepage_data["recentManualEntries"][selection[0]]
        self.refresh_manual_list()
        self.on_manual_select()

    def move_manual_entry(self, direction):
        selection = self.manual_listbox.curselection()
        if not selection:
            return
        idx = selection[0]
        new_idx = idx + direction
        entries = self.homepage_data["recentManualEntries"]
        if 0 <= new_idx < len(entries):
            entries[idx], entries[new_idx] = entries[new_idx], entries[idx]
            self.refresh_manual_list()
            self.manual_listbox.select_set(new_idx)
            self.on_manual_select()

    def on_manual_select(self):
        for widget in self.manual_form_frame.winfo_children():
            widget.destroy()

        selection = self.manual_listbox.curselection()
        if not selection:
            return

        index = selection[0]
        entry = self.homepage_data["recentManualEntries"][index]

        self.create_recent_entry_form(self.manual_form_frame, entry, index)

    def update_manual_label(self, index):
        entry = self.homepage_data["recentManualEntries"][index]
        display = entry.get("title", "Untitled")
        self.manual_listbox.delete(index)
        self.manual_listbox.insert(index, display)
        self.manual_listbox.select_set(index)

    def create_recent_entry_form(self, parent, entry, index):
        update_func = lambda: self.update_manual_label(index)

        self.add_entry(parent, "Display Title", entry, "title", on_change_func=update_func)
        self.add_text_area(parent, "Display description", entry, "description", height=3, on_change_func=update_func)
        self.add_entry(parent, "Date Label (Optional)", entry, "dateLabel", on_change_func=update_func)
        self.add_entry(parent, "Link URL", entry, "link", on_change_func=update_func)
        self.add_entry(parent, "Call to Action Label", entry, "ctaLabel", on_change_func=update_func)
        self.add_entry(parent, "Image URL (Optional)", entry, "imageUrl", on_change_func=update_func)

    def get_default_featured_entry(self):
        return {"type": "project", "id": "", "imageOverride": ""}

    def build_homepage_source_entries(self):
        entries = []
        for paper in self.data.get("research_papers", []):
            if not paper.get("id"): continue
            entries.append({
                "type": "paper", "id": paper["id"], "title": paper.get("title", "Untitled"), "label": f"Research • {paper.get('title', 'Untitled')}"
            })
        for project in self.data.get("projects", []):
            if not project.get("id"): continue
            entries.append({
                "type": "project", "id": project["id"], "title": project.get("title", "Untitled"), "label": f"Project • {project.get('title', 'Untitled')}"
            })
        for post in self.data.get("blog_posts", []):
            if not post.get("id"): continue
            entries.append({
                "type": "blog", "id": post["id"], "title": post.get("title", "Untitled"), "label": f"Garden • {post.get('title', 'Untitled')}"
            })
        return entries

    # ==========================
    # TAB 1: PROFILE
    # ==========================
    def create_profile_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Profile")
        
        frame = self.create_scrollable_frame(tab)
        p_data = self.data.get("profile", {})
        
        # Fields
        self.add_entry(frame, "Name", p_data, "name")
        self.add_entry(frame, "Role", p_data, "role")
        self.add_entry(frame, "Affiliation", p_data, "affiliation")
        self.add_entry(frame, "Email", p_data, "email")
        self.add_text_area(frame, "Bio", p_data, "bio")
        self.add_checkbox(frame, "Show Bio in Sidebar?", p_data, "showBio")
        
        ttk.Label(frame, text="Social Links", font=("Arial", 10, "bold")).pack(pady=(20, 5), anchor='w')
        socials = p_data.get("socials", {})
        self.add_entry(frame, "Github URL", socials, "github")
        self.add_entry(frame, "LinkedIn URL", socials, "linkedin")
        self.add_entry(frame, "Google Scholar URL", socials, "scholar")
        self.add_entry(frame, "Twitter/X URL", socials, "twitter")

        # CV PDF Link (Managed in Navigation)
        ttk.Label(frame, text="Curriculum Vitae", font=("Arial", 10, "bold")).pack(pady=(20, 5), anchor='w')
        
        # Find current CV path
        nav_items = self.data.get("navigation", [])
        cv_item = next((item for item in nav_items if item.get("name") == "CV"), None)
        
        # Helper dict to bind to the entry
        cv_data = {"path": cv_item["path"] if cv_item else ""}
        
        def update_cv_path(*args):
            new_path = cv_data["path"]
            # Update navigation array
            n_items = self.data.get("navigation", [])
            found = False
            for item in n_items:
                if item.get("name") == "CV":
                    item["path"] = new_path
                    found = True
                    break
            if not found and new_path:
                n_items.append({"name": "CV", "path": new_path, "isExternal": True})
                self.data["navigation"] = n_items
        
        # We attach a trace to update the main data structure whenever the local helper changes
        # Note: add_pdf_selector will bind to cv_data["path"]
        # We need a mechanism to trigger update_cv_path when cv_data["path"] changes.
        # add_pdf_selector writes to the dict directly. 
        # So we can't easily attach a trace to a dict value change.
        # Instead, we pass a lambda that updates the dict AND runs our logic?
        # Actually, add_pdf_selector uses a StringVar and traces it. 
        # But it accepts a data_dict.
        
        # Let's create a specialized add_pdf_selector or modify the existing one to take a callback?
        # Or just manually implement it here.
        
        frame_cv = ttk.Frame(frame)
        frame_cv.pack(fill='x', pady=5, padx=5)
        ttk.Label(frame_cv, text="CV PDF Path", width=30, anchor='w').pack(side='left')
        
        cv_var = tk.StringVar(value=cv_data["path"])
        
        def get_pdf_files():
            uploads_dir = os.path.join("public", "uploads")
            if not os.path.exists(uploads_dir): return []
            try:
                files = [f for f in os.listdir(uploads_dir) if f.lower().endswith('.pdf')]
                return [f"/uploads/{f}" for f in files] + ["/cv.pdf"]
            except OSError: return []

        cv_combo = ttk.Combobox(frame_cv, textvariable=cv_var, values=get_pdf_files())
        cv_combo.pack(side='left', fill='x', expand=True)
        cv_combo.configure(postcommand=lambda: cv_combo.configure(values=get_pdf_files()))
        
        def on_cv_change(*args):
            cv_data["path"] = cv_var.get()
            update_cv_path()
            
        cv_var.trace_add("write", on_cv_change)

    # ==========================
    # TAB 2: RESEARCH
    # ==========================
    def create_research_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Research")

        # Create a frame that contains both the top description editor and the bottom list editor
        container = ttk.Frame(tab)
        container.pack(fill='both', expand=True)
        
        # Top: Research Page Settings
        settings_frame = ttk.LabelFrame(container, text="Page Settings", padding=10)
        settings_frame.pack(fill='x', padx=10, pady=(10, 0))
        
        if "researchPage" not in self.data:
            self.data["researchPage"] = {"description": "My undergraduate research focuses on quantum error mitigation"}
        
        self.add_text_area(settings_frame, "Page Description", self.data["researchPage"], "description", height=3)

        # Bottom: List Editor
        # We reuse create_list_editor logic but pass the container as parent
        self.create_list_editor(
            "Research Papers", 
            "research_papers", 
            self.get_paper_display, 
            self.create_paper_form,
            parent_widget=container
        )

    def get_paper_display(self, item):
        return f"{item.get('year', '')} - {item.get('title', 'Untitled')}"

    def create_paper_form(self, parent, item):
        self.add_entry(parent, "Title", item, "title")
        self.add_entry(parent, "Venue/Journal", item, "venue")
        self.add_entry(parent, "Year", item, "year", is_int=True)
        self.add_entry(parent, "Authors (comma separated)", item, "authors", is_list=True)
        self.add_text_area(parent, "Description", item, "description")
        # self.add_entry(parent, "Tags (comma separated)", item, "tags", is_list=True)
        self.add_tag_selector(parent, "Tags", item, "tags")
        
        ttk.Label(parent, text="Links & Assets", font=("Arial", 10, "bold")).pack(pady=(15, 5), anchor='w')
        self.add_file_selector(parent, "Detailed Content", item, "content")
        self.add_pdf_selector(parent, "PDF Link (URL or relative path)", item, "pdfLink")
        self.add_entry(parent, "Code Link (URL)", item, "codeLink")
        self.add_text_area(parent, "BibTeX", item, "bibtex", height=4)

    # ==========================
    # TAB 3: PROJECTS
    # ==========================
    def create_projects_tab(self):
        self.create_list_editor(
            "Projects", 
            "projects", 
            lambda x: x.get('title', 'Untitled'), 
            self.create_project_form
        )

    def create_project_form(self, parent, item):
        self.add_entry(parent, "Project Title", item, "title")
        self.add_text_area(parent, "Description", item, "description")
        self.add_entry(parent, "Cover Image URL (Optional)", item, "imageUrl")
        self.add_file_selector(parent, "Detailed Content", item, "content")
        self.add_entry(parent, "Tech Stack (comma separated)", item, "techStack", is_list=True)
        
        ttk.Label(parent, text="Links", font=("Arial", 10, "bold")).pack(pady=(15, 5), anchor='w')
        self.add_entry(parent, "Demo/Live Link", item, "link")
        self.add_entry(parent, "Github Repo", item, "github")

    # ==========================
    # TAB 4: GARDEN (BLOG)
    # ==========================
    def create_garden_tab(self):
        self.create_list_editor(
            "Garden",
            "blog_posts",
            lambda x: f"{x.get('date','')} - {x.get('title', 'Untitled')}",
            self.create_post_form
        )

    def create_file_manager_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="File Manager")
        
        frame = self.create_scrollable_frame(tab)
        
        ttk.Label(frame, text="File Manager (Uploads)", font=("Arial", 14, "bold")).pack(pady=10, anchor='w')
        ttk.Label(frame, text="Upload PDF files or images to be used in posts/papers.", font=("Arial", 10)).pack(anchor='w')
        
        # Button to upload new file
        ttk.Button(frame, text="Upload New File", command=lambda: self.upload_file_manager(frame)).pack(pady=10, anchor='w')
        
        # List of existing files
        self.file_list_frame = ttk.LabelFrame(frame, text="Existing Files in public/uploads")
        self.file_list_frame.pack(fill='both', expand=True, pady=10)
        
        self.refresh_file_list()

    def refresh_file_list(self):
        for widget in self.file_list_frame.winfo_children():
            widget.destroy()
            
        uploads_dir = os.path.join("public", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir, exist_ok=True)
            
        files = os.listdir(uploads_dir)
        if not files:
            ttk.Label(self.file_list_frame, text="No files found.").pack(padx=5, pady=5)
            return
            
        for f in files:
            row = ttk.Frame(self.file_list_frame)
            row.pack(fill='x', pady=2, padx=5)
            ttk.Label(row, text=f).pack(side='left')
            # Copy path button
            path = f"/uploads/{f}"
            ttk.Button(row, text="Copy Path", command=lambda p=path: self.root.clipboard_clear() or self.root.clipboard_append(p)).pack(side='right', padx=2)
            
    def upload_file_manager(self, parent_frame):
        file_path = filedialog.askopenfilename()
        if not file_path:
            return
            
        uploads_dir = os.path.join("public", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir, exist_ok=True)
            
        filename = os.path.basename(file_path)
        dest_path = os.path.join(uploads_dir, filename)
        
        try:
            shutil.copy2(file_path, dest_path)
            messagebox.showinfo("Success", f"Uploaded {filename}")
            self.refresh_file_list()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to upload: {e}")

    # ==========================
    # TAB: TAG MANAGER
    # ==========================
    def create_tag_manager_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Tag Manager")
        
        # Ensure global tags exist
        if "tags" not in self.data:
            self.data["tags"] = []
            
        frame = self.create_scrollable_frame(tab)
        
        ttk.Label(frame, text="Global Tag Manager", font=("Arial", 14, "bold")).pack(pady=10, anchor='w')
        ttk.Label(frame, text="Manage the list of tags available for selection.", font=("Arial", 10)).pack(anchor='w', pady=(0, 10))

        # Container for list and entry
        content_frame = ttk.Frame(frame)
        content_frame.pack(fill='both', expand=True, padx=5)

        listbox_frame = ttk.Frame(content_frame)
        listbox_frame.pack(side='left', fill='both', expand=True)
        
        self.tags_listbox = tk.Listbox(listbox_frame, font=("Arial", 11))
        self.tags_listbox.pack(side='left', fill='both', expand=True)
        
        scrollbar = ttk.Scrollbar(listbox_frame, orient="vertical", command=self.tags_listbox.yview)
        scrollbar.pack(side='right', fill='y')
        self.tags_listbox.config(yscrollcommand=scrollbar.set)
        
        controls_frame = ttk.Frame(content_frame)
        controls_frame.pack(side='right', fill='y', padx=10, anchor='n')
        
        entry_var = tk.StringVar()
        entry = ttk.Entry(controls_frame, textvariable=entry_var, width=20)
        entry.pack(pady=5)
        
        def refresh_tags():
             self.tags_listbox.delete(0, tk.END)
             for t in sorted(self.data["tags"], key=lambda s: s.lower()):
                 self.tags_listbox.insert(tk.END, t)

        def add_tag():
            new_tag = entry_var.get().strip()
            if new_tag and new_tag not in self.data["tags"]:
                self.data["tags"].append(new_tag)
                self.data["tags"].sort(key=lambda s: s.lower())
                refresh_tags()
                entry_var.set("")
            elif new_tag in self.data["tags"]:
                messagebox.showwarning("Duplicate", "Tag already exists.")

        def delete_tag():
            sel = self.tags_listbox.curselection()
            if not sel: return
            tag = self.tags_listbox.get(sel)
            if messagebox.askyesno("Confirm", f"Delete tag '{tag}'?"):
                self.data["tags"].remove(tag)
                refresh_tags()

        ttk.Button(controls_frame, text="Add Tag", command=add_tag).pack(fill='x', pady=2)
        ttk.Button(controls_frame, text="Delete Selected", command=delete_tag).pack(fill='x', pady=2)
        
        refresh_tags()
        # Store refresh function so it can be called if needed
        self.refresh_tags_listbox = refresh_tags

    # ==========================
    # POST EDITOR
    # ==========================
    def create_post_editor_tab(self):
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="Post Editor")

        frame = self.create_scrollable_frame(tab)

        # Local data for this tab, not persisted until save
        self.post_editor_data = {"title": "", "date": str(datetime.date.today()), "excerpt": "", "tags": [], "content_md": "", "pdfAttachment": "", "filename": ""}

        ttk.Label(frame, text="Create New Blog Post", font=("Arial", 14, "bold")).pack(pady=10, anchor='w')

        self.add_entry(frame, "Post Title", self.post_editor_data, "title")
        self.add_entry(frame, "Date (YYYY-MM-DD)", self.post_editor_data, "date")
        self.add_text_area(frame, "Excerpt", self.post_editor_data, "excerpt", height=3)
        # self.add_entry(frame, "Tags (comma separated)", self.post_editor_data, "tags", is_list=True)
        self.add_tag_selector(frame, "Tags", self.post_editor_data, "tags") 
        self.add_pdf_selector(frame, "PDF Attachment (optional path)", self.post_editor_data, "pdfAttachment")
        
        # Capture the text widget to insert links later
        self.post_content_widget = tk.Text(frame, height=10, font=("Arial", 10))
        # Re-implement add_text_area manually for this component to capture widget
        frame_md = ttk.Frame(frame)
        frame_md.pack(fill='x', pady=5, padx=5)
        ttk.Label(frame_md, text="Markdown Content", anchor='w').pack(fill='x')
        self.post_content_widget = scrolledtext.ScrolledText(frame_md, height=10, font=("Arial", 10))
        self.post_content_widget.pack(fill='x', pady=2)
        def on_change_md(e):
            self.post_editor_data["content_md"] = self.post_content_widget.get("1.0", "end-1c")
        self.post_content_widget.bind("<KeyRelease>", on_change_md)
        
        # Attachment Button
        ttk.Button(frame, text="Upload & Link Local File", command=self.upload_and_link_file).pack(pady=5, padx=5, anchor='w')

        gen_frame = ttk.Frame(frame)
        gen_frame.pack(fill='x', pady=5, padx=5)
        ttk.Button(gen_frame, text="Generate Filename", command=self.generate_filename).pack(side='left')
        self.filename_label = ttk.Label(gen_frame, text="[click Generate]")
        self.filename_label.pack(side='left', padx=10)

        ttk.Button(frame, text="Save Post", command=self.save_post).pack(pady=20)

    def upload_and_link_file(self):
        file_path = filedialog.askopenfilename()
        if not file_path:
            return
            
        uploads_dir = os.path.join("public", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir, exist_ok=True)
            
        filename = os.path.basename(file_path)
        dest_path = os.path.join(uploads_dir, filename)
        
        try:
            shutil.copy2(file_path, dest_path)
            
            # Insert markdown link
            # Check if it's an image for image syntax vs link syntax
            is_image = filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))
            if is_image:
                link_text = f"![{filename}](/uploads/{filename})"
            else:
                link_text = f"[{filename}](/uploads/{filename})"
                
            self.post_content_widget.insert(tk.INSERT, f"\n{link_text}")
            self.post_editor_data["content_md"] = self.post_content_widget.get("1.0", "end-1c")
            
            messagebox.showinfo("Success", f"Uploaded {filename} and added link.")
            # Also refresh the file manager tab list if it exists
            if hasattr(self, 'file_list_frame'):
                 self.refresh_file_list()
                 
        except Exception as e:
            messagebox.showerror("Error", f"Failed to upload file: {e}")

    def generate_filename(self):
        title = self.post_editor_data.get("title", "untitled").strip()
        fname = "".join(c for c in title.replace(" ", "-").replace("/", "-") if c.isalnum() or c in "-")
        fname = fname.lower().strip("-")
        if not fname:
            fname = "post"
        full_fname = f"{fname}.md"
        # Check if exists
        posts_dir = "posts"
        os.makedirs(posts_dir, exist_ok=True)
        if os.path.exists(os.path.join(posts_dir, full_fname)):
            timestamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
            full_fname = f"{fname}-{timestamp}.md"
        self.post_editor_data["filename"] = full_fname
        self.filename_label.config(text=full_fname)

    def save_post(self):
        title = self.post_editor_data.get("title", "").strip()
        if not title:
            messagebox.showerror("Error", "Title is required.")
            return
        content = self.post_editor_data.get("content_md", "").strip()
        if not content:
            messagebox.showerror("Error", "Content is required.")
            return
        filename = self.post_editor_data.get("filename")
        if not filename:
            messagebox.showerror("Error", "Generate filename first.")
            return

        posts_dir = "posts"
        filepath = os.path.join(posts_dir, filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file: {e}")
            return

        # Generate id
        import random
        new_id = str(random.randint(1000, 9999))
        new_post = {
            "id": new_id,
            "title": title,
            "date": self.post_editor_data.get("date", str(datetime.date.today())),
            "excerpt": self.post_editor_data.get("excerpt", ""),
            "content": f"posts/{filename}",
            "pdfAttachment": self.post_editor_data.get("pdfAttachment", ""),
            "tags": self.post_editor_data.get("tags", [])
        }
        self.data.setdefault("blog_posts", []).insert(0, new_post)

        messagebox.showinfo("Success", f"Post '{title}' saved and added to Garden.")
        # Reset
        self.post_editor_data.update({"title": "", "excerpt": "", "tags": [], "content_md": "", "pdfAttachment": ""})
        self.filename_label.config(text="[click Generate]")

    def create_post_form(self, parent, item):
        self.add_entry(parent, "Post Title", item, "title")
        self.add_entry(parent, "Date", item, "date")
        self.add_text_area(parent, "Excerpt", item, "excerpt", height=3)

        self.add_file_selector(parent, "Content", item, "content")

        self.add_pdf_selector(parent, "PDF Attachment (optional)", item, "pdfAttachment")
        # self.add_entry(parent, "Tags (comma separated)", item, "tags", is_list=True)
        self.add_tag_selector(parent, "Tags", item, "tags")

    # ==========================
    # GENERIC LIST EDITOR LOGIC
    # ==========================
    def create_list_editor(self, tab_name, json_key, display_func, form_func, parent_widget=None):
        if parent_widget:
            # Use existing parent (which should be a frame or tab content area)
            # We need a frame to hold the paned window
            tab = ttk.Frame(parent_widget)
            tab.pack(fill='both', expand=True)
        else:
            # Create new tab
            tab = ttk.Frame(self.notebook)
            self.notebook.add(tab, text=tab_name)
        
        paned = ttk.PanedWindow(tab, orient='horizontal')
        paned.pack(fill='both', expand=True, padx=10, pady=10)
        
        left_frame = ttk.Frame(paned, width=300)
        paned.add(left_frame, weight=1)
        
        listbox = tk.Listbox(left_frame, selectmode=tk.SINGLE)
        listbox.pack(side='top', fill='both', expand=True)
        
        btn_frame = ttk.Frame(left_frame)
        btn_frame.pack(side='bottom', fill='x', pady=5)
        
        right_frame = ttk.Frame(paned)
        paned.add(right_frame, weight=3)
        
        current_list = self.data.get(json_key, [])
        
        def refresh_list():
            listbox.delete(0, tk.END)
            for item in current_list:
                listbox.insert(tk.END, display_func(item))
        
        def on_select(event):
            for widget in right_frame.winfo_children():
                widget.destroy()
                
            selection = listbox.curselection()
            if not selection:
                return
                
            index = selection[0]
            item = current_list[index]
            
            canvas = tk.Canvas(right_frame)
            scrollbar = ttk.Scrollbar(right_frame, orient="vertical", command=canvas.yview)
            form_area = ttk.Frame(canvas)
            
            form_area.bind(
                "<Configure>",
                lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
            )
            
            canvas.create_window((0, 0), window=form_area, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)
            
            canvas.pack(side="left", fill="both", expand=True)
            scrollbar.pack(side="right", fill="y")
            
            ttk.Label(form_area, text=f"Editing: {display_func(item)}", font=("Arial", 12, "bold")).pack(pady=10, anchor='w')
            form_func(form_area, item)
            
            def update_list_label(e):
                listbox.delete(index)
                listbox.insert(index, display_func(item))
                listbox.select_set(index)
            
            form_area.bind_all("<KeyRelease>", update_list_label)

        listbox.bind('<<ListboxSelect>>', on_select)
        
        def add_item():
            import random
            new_id = str(random.randint(1000, 9999))
            new_item = {"id": new_id, "title": "New Item", "tags": [], "authors": [], "techStack": []}
            current_list.insert(0, new_item)
            refresh_list()
            listbox.select_set(0)
            on_select(None)
            
        def remove_item():
            selection = listbox.curselection()
            if not selection: return
            if messagebox.askyesno("Confirm", "Delete this item?"):
                current_list.pop(selection[0])
                refresh_list()
                for widget in right_frame.winfo_children():
                    widget.destroy()

        ttk.Button(btn_frame, text="+ Add New", command=add_item).pack(side='left', fill='x', expand=True)
        ttk.Button(btn_frame, text="- Delete", command=remove_item).pack(side='left', fill='x', expand=True)

        refresh_list()

    # ==========================
    # FORM WIDGET HELPERS
    # ==========================
    def add_tag_selector(self, parent, label, data_dict, key):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)

        ttk.Label(frame, text=label, width=30, anchor='w').pack(side='left')
        
        # Display current tags as text
        tags_var = tk.StringVar()
        current_tags = data_dict.get(key, [])
        if not isinstance(current_tags, list):
            current_tags = []
            data_dict[key] = current_tags
            
        tags_var.set(", ".join(current_tags))
        
        display_entry = ttk.Entry(frame, textvariable=tags_var, state='readonly')
        display_entry.pack(side='left', fill='x', expand=True, padx=(0, 5))
        
        def open_tag_dialog():
            dialog = tk.Toplevel(self.root)
            dialog.title("Select Tags")
            dialog.geometry("400x400")
            
            # Make it modal
            dialog.transient(self.root)
            dialog.grab_set()
            
            scroll_frame = ttk.Frame(dialog)
            scroll_frame.pack(fill='both', expand=True, padx=10, pady=10)
            
            canvas = tk.Canvas(scroll_frame)
            scrollbar = ttk.Scrollbar(scroll_frame, orient="vertical", command=canvas.yview)
            list_frame = ttk.Frame(canvas)
            
            list_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
            canvas.create_window((0, 0), window=list_frame, anchor='nw')
            canvas.configure(yscrollcommand=scrollbar.set)
            
            canvas.pack(side='left', fill='both', expand=True)
            scrollbar.pack(side='right', fill='y')
            
            # Checkboxes for all available tags
            available_tags = self.data.get("tags", [])
            # Ensure sorted
            available_tags.sort(key=lambda s: s.lower())
            
            tag_vars = {}
            for t in available_tags:
                var = tk.BooleanVar(value=(t in current_tags))
                tag_vars[t] = var
                ttk.Checkbutton(list_frame, text=t, variable=var).pack(anchor='w')
                
            def save_selection():
                new_tags = [t for t, var in tag_vars.items() if var.get()]
                data_dict[key] = new_tags
                tags_var.set(", ".join(new_tags))
                dialog.destroy()
                
            ttk.Button(dialog, text="OK", command=save_selection).pack(pady=10, fill='x', padx=10)
            
            self.root.wait_window(dialog)

        ttk.Button(frame, text="Select...", command=open_tag_dialog).pack(side='right')

    def add_file_selector(self, parent, label, data_dict, key):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)

        ttk.Label(frame, text=label, width=30, anchor='w').pack(side='left')

        var = tk.StringVar(value=str(data_dict.get(key, "")))
        
        # Function to get files
        def get_md_files():
            try:
                files = [f for f in os.listdir('posts') if f.endswith('.md')]
                return [f"posts/{f}" for f in files]
            except OSError:
                return []

        combo = ttk.Combobox(frame, textvariable=var, values=get_md_files())
        combo.pack(side='left', fill='x', expand=True)
        
        # Refresh values on click
        def postcommand():
            combo['values'] = get_md_files()
        combo.configure(postcommand=postcommand)

        def on_change(*args):
             data_dict[key] = var.get()
        var.trace_add("write", on_change)

    def add_pdf_selector(self, parent, label, data_dict, key):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)

        ttk.Label(frame, text=label, width=30, anchor='w').pack(side='left')

        var = tk.StringVar(value=str(data_dict.get(key, "")))
        
        # Function to get files
        def get_pdf_files():
            uploads_dir = os.path.join("public", "uploads")
            if not os.path.exists(uploads_dir):
                return []
            try:
                files = [f for f in os.listdir(uploads_dir) if f.lower().endswith('.pdf')]
                return [f"/uploads/{f}" for f in files]
            except OSError:
                return []

        combo = ttk.Combobox(frame, textvariable=var, values=get_pdf_files())
        combo.pack(side='left', fill='x', expand=True)
        
        # Refresh values on click
        def postcommand():
            combo['values'] = get_pdf_files()
        combo.configure(postcommand=postcommand)

        def on_change(*args):
             data_dict[key] = var.get()
        var.trace_add("write", on_change)

    def add_dual_font_controls(self, parent, data_dict, label_prefix, key_prefix):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=2, padx=5)
        
        font_frame = ttk.Frame(frame)
        font_frame.pack(fill='x')
        
        # English Font Selection
        eng_frame = ttk.Frame(font_frame)
        eng_frame.pack(side='left', fill='x', expand=True)
        ttk.Label(eng_frame, text=f"{label_prefix} English Font").pack(anchor='w')
        
        eng_options = {
            "Cinzel (Serif)": "Cinzel",
            "Palatino (Body)": "\"Palatino Linotype\", \"Book Antiqua\", Palatino",
            "Fallback Serif": "serif"
        }
        eng_reverse = {v: k for k, v in eng_options.items()}
        eng_var = tk.StringVar()
        current_eng = data_dict.get(f"{key_prefix}FontEng", "Cinzel")
        eng_var.set(eng_reverse.get(current_eng, "Cinzel (Serif)"))
        eng_combo = ttk.Combobox(eng_frame, values=list(eng_options.keys()), textvariable=eng_var, state="readonly")
        eng_combo.pack(fill='x')
        
        def on_eng_change(*args):
            data_dict[f"{key_prefix}FontEng"] = eng_options.get(eng_var.get(), "Cinzel")
        eng_var.trace_add("write", on_eng_change)

        # Chinese Font Selection
        cn_frame = ttk.Frame(font_frame)
        cn_frame.pack(side='left', fill='x', expand=True, padx=(5, 0))
        ttk.Label(cn_frame, text=f"{label_prefix} Chinese Font").pack(anchor='w')
        
        cn_options = {
            "Noto Serif SC": "\"Noto Serif SC\"",
            "System Serif": "serif"
        }
        cn_reverse = {v: k for k, v in cn_options.items()}
        cn_var = tk.StringVar()
        current_cn = data_dict.get(f"{key_prefix}FontCn", "\"Noto Serif SC\"")
        cn_var.set(cn_reverse.get(current_cn, "Noto Serif SC"))
        cn_combo = ttk.Combobox(cn_frame, values=list(cn_options.keys()), textvariable=cn_var, state="readonly")
        cn_combo.pack(fill='x')
        
        def on_cn_change(*args):
            data_dict[f"{key_prefix}FontCn"] = cn_options.get(cn_var.get(), "\"Noto Serif SC\"")
        cn_var.trace_add("write", on_cn_change)

        # Font Size Entry
        size_frame = ttk.Frame(frame)
        size_frame.pack(fill='x', pady=(4, 0))
        ttk.Label(size_frame, text=f"{label_prefix} Size (Tailwind Classes)").pack(anchor='w')
        
        size_var = tk.StringVar(value=str(data_dict.get(f"{key_prefix}Size", "")))
        size_entry = ttk.Entry(size_frame, textvariable=size_var)
        size_entry.pack(fill='x')
        
        def on_size_change(*args):
            data_dict[f"{key_prefix}Size"] = size_var.get()
        size_var.trace_add("write", on_size_change)

    def add_checkbox(self, parent, label, data_dict, key):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)
        
        var = tk.BooleanVar(value=data_dict.get(key, False))
        
        chk = ttk.Checkbutton(frame, text=label, variable=var, 
            command=lambda: data_dict.__setitem__(key, var.get()))
        chk.pack(anchor='w')

    def add_entry(self, parent, label, data_dict, key, is_list=False, is_int=False, on_change_func=None):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)

        ttk.Label(frame, text=label, width=30, anchor='w').pack(side='left')

        var = tk.StringVar()

        val = data_dict.get(key, "")
        if is_list and isinstance(val, list):
            var.set(", ".join(val))
        else:
            var.set(str(val))

        entry = ttk.Entry(frame, textvariable=var)
        entry.pack(side='left', fill='x', expand=True)

        def on_change(*args):
            new_val = var.get()
            if is_list:
                data_dict[key] = [x.strip() for x in new_val.split(",") if x.strip()]
            elif is_int:
                try:
                    data_dict[key] = int(new_val)
                except ValueError:
                    data_dict[key] = 0
            else:
                data_dict[key] = new_val

            if on_change_func:
                on_change_func()

        var.trace_add("write", on_change)

    def add_text_area(self, parent, label, data_dict, key, height=5, on_change_func=None):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=5, padx=5)

        ttk.Label(frame, text=label, anchor='w').pack(fill='x')

        txt = scrolledtext.ScrolledText(frame, height=height, font=("Arial", 10))
        txt.pack(fill='x', pady=2)

        val = data_dict.get(key, "")
        txt.insert("1.0", str(val))

        def on_change(e):
            data_dict[key] = txt.get("1.0", "end-1c")
            if on_change_func:
                on_change_func()

        txt.bind("<KeyRelease>", on_change)

    def choose_file(self, item, content_var):
        try:
            posts_files = [f for f in os.listdir('posts') if f.endswith('.md')]
        except OSError:
            posts_files = []
        if not posts_files:
            messagebox.showinfo("No Files", "No .md files in posts/ directory.")
            return
        popup = tk.Toplevel()
        popup.title("Choose Markdown File")
        popup.geometry("300x300")
        listbox = tk.Listbox(popup)
        listbox.pack(fill='both', expand=True)
        for f in posts_files:
            listbox.insert(tk.END, f)
        def select():
            sel = listbox.curselection()
            if sel:
                filename = listbox.get(sel)
                content_var.set(f"posts/{filename}")
                popup.destroy()
        ttk.Button(popup, text="OK", command=select).pack(side='left')
        ttk.Button(popup, text="Cancel", command=popup.destroy).pack(side='right')

if __name__ == "__main__":
    root = tk.Tk()
    app = WebsiteCMS(root)
    root.mainloop()
