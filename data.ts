const data = {
  "hero": {
    "headline": "\u5b50\u6839\u658b",
    "subheadline": "Exploring Quantum Information Science, Simulations, and the complexity of our natrual world.",
    "headlineFontEng": "Cinzel",
    "headlineFontCn": "\"Noto Serif SC\"",
    "headlineSize": "text-5xl md:text-7xl lg:text-8xl",
    "subheadlineFontEng": "\"Palatino Linotype\"",
    "subheadlineFontCn": "\"Noto Serif SC\"",
    "subheadlineSize": "text-xl md:text-2xl lg:text-3xl"
  },
  "homepage": {
    "tabTitle": "G. Z. Luo",
    "projectsDescription": "Fun projects that I do",
    "recentMode": "auto",
    "recentAutoLimit": 3,
    "recentManualEntries": [
      {
        "title": "Trewartha Thesis Research Grant",
        "dateLabel": "11-2025",
        "description": "Awarded for senior thesis conducting a theoretical and numerical study of Gottesman-Kitaev-Preskill (GKP) codes under pure-loss decoherence.",
        "link": "",
        "ctaLabel": "",
        "imageUrl": ""
      }
    ],
    "featuredEntry": {
      "type": "paper",
      "id": "p1",
      "imageOverride": ""
    }
  },
  "researchPage": {
    "description": "My undergraduate research focuses on quantum error mitigation."
  },
  "tags": [
    "CNN",
    "Control Theory",
    "Deep Learning",
    "Error Mitigation",
    "FEA",
    "Math",
    "MATLAB",
    "MILP",
    "Optimization",
    "Python",
    "Quantum",
    "Quantum Computing",
    "Quantum Metrology",
    "Quantum Physics",
    "QuTiP",
    "Simulation",
    "Simulink",
    "Stochastic Modeling"
  ],
  "profile": {
    "name": "Guizhong (Harry) Luo",
    "role": "Undergraduate Researcher",
    "affiliation": "University of Wisconsin - Madison",
    "bio": "Exploring Quantum Information Science, Simulations, and the complexity of our natrual world.",
    "showBio": false,
    "email": "harry.luo@wisc.edu",
    "socials": {
      "github": "https://github.com/HarryLuoo",
      "linkedin": "https://linkedin.com/in/gzluo",
      "scholar": "",
      "twitter": ""
    }
  },
  "navigation": [
    {
      "name": "HOME",
      "path": "/"
    },
    {
      "name": "RESEARCH",
      "path": "/research"
    },
    {
      "name": "PROJECTS",
      "path": "/projects"
    },
    {
      "name": "GARDEN",
      "path": "/garden"
    },
    {
      "name": "CV",
      "path": "/uploads/Harry CV.pdf",
      "isExternal": true
    }
  ],
  "research_papers": [
    {
      "id": "p1",
      "title": "Energy-Scaled Zero Noise Extrapolation for Gottesman-Kitaev-Preskill Code",
      "authors": [
        "Guizhong Luo",
        "Matthew Otten"
      ],
      "venue": "Preparing",
      "year": 2025,
      "description": "Theoretical and numerical study of Gottesman-Kitaev-Preskill (GKP) codes under pure-loss decoherence. Developed an energy-scaled zero-noise extrapolation method for quantum error mitigation in bosonic codes. Paper in preparation.",
      "tags": [
        "Quantum Computing",
        "Error Mitigation"
      ],
      "pdfLink": "#",
      "codeLink": "#",
      "content": ""
    },
    {
      "id": "p2",
      "title": "Contextual Quantum Fisher Information Verification",
      "authors": [
        "Quantum Photonics Lab (NJU)"
      ],
      "venue": "Research Experience",
      "year": 2024,
      "description": "Verified theoretical framework of contextual quantum Fisher information through numerical simulations and compared performance versus traditional QFI in metrology applications.",
      "tags": [
        "Quantum Metrology",
        "Python",
        "Simulation"
      ],
      "pdfLink": "",
      "content": ""
    }
  ],
  "projects": [
    {
      "id": "pr1",
      "title": "Badger Solar Car Optimization",
      "description": "Numerical simulation and optimization system for a solar-powered race car. Implemented receding horizon control and modeled electrical/mechanical components (Solar Array, BMS, Resistive Forces) in MATLAB & Simulink.",
      "techStack": [
        "MATLAB",
        "Simulink",
        "Control Theory"
      ],
      "imageUrl": "",
      "github": "#",
      "content": ""
    },
    {
      "id": "pr2",
      "title": "Campus Dining Optimization",
      "description": "A Mixed-Integer Linear Programming (MILP) project for optimizing weekly restaurant choices under constraints of time, money, and nutrients. Top Course Project for ISyE 524.",
      "techStack": [
        "Optimization",
        "MILP",
        "Python"
      ],
      "imageUrl": "",
      "github": "#",
      "content": ""
    },
    {
      "id": "pr3",
      "title": "Multi-Qubit Crosstalk Simulation",
      "description": "Winner of Quantum + Chips 2025 Hackathon. Simulated a 3-qubit system coupled under a driving magnetic field to observe crosstalk and mitigated it using a compensation Hamiltonian.",
      "techStack": [
        "QuTiP",
        "Python",
        "Quantum Physics"
      ],
      "imageUrl": "",
      "github": "#",
      "content": ""
    },
    {
      "id": "pr4",
      "title": "Brachistochrone FEA Solution",
      "description": "Numerical solution to the classical Brachistochrone problem using Finite Element Analysis with P2 element discretization. Applied Gaussian quadrature and L-BFGS-B optimization.",
      "techStack": [
        "FEA",
        "Optimization",
        "Math"
      ],
      "imageUrl": "",
      "github": "#",
      "content": "posts/brachistochrone.md"
    },
    {
      "id": "pr5",
      "title": "Deep-time Steps: Patterns of Wear",
      "description": "Stochastic model to simulate stair wear patterns based on probabilistic pedestrian behavior. Trained a CNN on the simulation to analyze usage patterns.",
      "techStack": [
        "Deep Learning",
        "CNN",
        "Stochastic Modeling"
      ],
      "imageUrl": "",
      "github": "#",
      "content": ""
    }
  ],
  "blog_posts": [
    {
      "id": "b1",
      "title": "Solving the Brachistochrone with FEA",
      "date": "Apr 15, 2025",
      "excerpt": "A numerical approach to the classical curve of fastest descent using Finite Element Analysis and P2 discretization.",
      "content": "posts/brachistochrone.md",
      "tags": [
        "Math",
        "FEA",
        "Optimization"
      ],
      "pdfAttachment": "#"
    },
    {
      "id": "b2",
      "title": "Simulating Quantum Crosstalk",
      "date": "Aug 20, 2025",
      "excerpt": "Insights from the Quantum + Chips Hackathon: using QuTiP to model compensation Hamiltonians.",
      "content": "Content coming soon...",
      "tags": [
        "Quantum",
        "Python"
      ]
    }
  ]
};
export default data;