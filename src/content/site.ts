/**
 * Single source of truth for everything on the page.
 * Edit text, links, numbers and lists here — no component needs touching.
 *
 * Sources: resume PDF, the intro image, your brief, and what the three live
 * project sites actually say about themselves. Anything unknown is left out or
 * optional (hidden when empty) rather than invented.
 */

export const site = {
  name: { display: "Adish", full: "Adrija Chowdhury" },
  role: "AI & Software Engineer",
  title: "Adish — AI & Software Engineer",
  description:
    "Adish is an Information Technology undergraduate at Jadavpur University building software and exploring AI engineering, LLMs and intelligent systems. CEO & co-founder at Threadpool, open-source contributor, competitive programmer.",
  availability: "Open to opportunities",
  email: "adishchowdhury18@gmail.com",
  location: "India",
  timezone: "Asia/Kolkata",
  links: {
    github: "https://github.com/adishchowdhury",
    linkedin: "https://www.linkedin.com/in/adrija-chowdhury-a19b80370/",
    // Optional — a link is hidden while its value is empty.
    codeforces: "",
    twitter: "",
  },
  /** How many cursors build the page in the "assemble" replay. */
  agents: 14,
  marquee: [
    "AI engineering",
    "LLMs",
    "AI agents",
    "Kestra",
    "Kubernetes",
    "Hackathons",
    "Competitive programming",
  ],
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
] as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  kicker: "Hello, I'm",
  headline: "ADISH",
  outline: "DEVELOPER",
  paragraph:
    "I'm studying IT at Jadavpur University and spend most of my time building. Right now that means LLM and agent systems, a company called Threadpool, and pull requests to Kestra and Kubernetes.",
};

/** The little "workspace" board. Every line is something real from the resume or brief. */
export const workspace = {
  now: [
    { k: "CEO", v: "Threadpool — building a more capable workforce" },
    { k: "CTO", v: "GoRoute — AI-powered travel management" },
    { k: "B.E.", v: "Information Technology, Jadavpur University" },
    { k: "B.S.", v: "Data Science & Applications, IIT Madras" },
  ],
  built: [
    { k: "Live", v: "ToofanOS", href: "https://toofan-os.vercel.app/" },
    { k: "Live", v: "CubeVerse", href: "https://cubeverse-dev.vercel.app/" },
    { k: "Live", v: "Crowdera", href: "https://crowdera-new.vercel.app/" },
  ],
  oss: [
    { k: "PRs", v: "Kestra — workflow orchestration" },
    { k: "PRs", v: "Kubernetes — cloud-native tooling" },
    { k: "Merged", v: "multiple pull requests" },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const about = {
  heading: ["HOW I", "GOT", "HERE"],
  paragraphs: [
    "I'm studying Information Technology at Jadavpur University, alongside a BS in Data Science and Applications at IIT Madras. Both started in 2025.",
    "I build software and explore intelligent systems: prompt and workflow optimization, AI-assisted products, and the agent tooling that is growing up around LLMs.",
    "Outside class I run companies and contribute to open source. CEO and co-founder at Threadpool, CTO at GoRoute, and merged pull requests in Kestra and Kubernetes.",
    "I call myself an improver: learn it, build with it, get better at it, repeat.",
  ],
  statement:
    "I don't just want to use technology. I want to understand it, experiment with it, and build with it.",
};

/**
 * Timeline. `year` is optional — shown only when set, so nothing is invented.
 * Fill the years in when you want them on the page.
 */
export const timeline: {
  title: string;
  body: string;
  year?: string;
  note: string;
}[] = [
  {
    title: "Early interest in programming",
    body: "Python, Java and JavaScript: the languages I build with.",
    note: "python / java / js",
  },
  {
    title: "Beginning competitive programming",
    body: "Specialist rating on Codeforces, plus olympiads, CTFs and hackathons.",
    note: "codeforces — specialist",
  },
  {
    title: "Starting my engineering journey",
    body: "Began a B.E. in Information Technology at Jadavpur University and a BS in Data Science and Applications at IIT Madras.",
    year: "2025",
    note: "ju + iit madras",
  },
  {
    title: "Exploring AI and machine learning",
    body: "Machine learning fundamentals, prompt optimization and AI-assisted systems. Still pursuing.",
    note: "ml / prompts",
  },
  {
    title: "Building real-world products",
    body: "CTO at GoRoute. CEO and co-founder at Threadpool. Hackathon builds: ToofanOS, CubeVerse, Crowdera.",
    note: "goroute / threadpool",
  },
  {
    title: "Exploring LLMs and agentic systems",
    body: "Optimizing AI system prompts and workflows, and building agents to see how intelligent software behaves.",
    note: "llms / agents",
  },
];

/* ------------------------------------------------------------------ */
/* Work                                                                */
/* ------------------------------------------------------------------ */

export type Project = {
  id: "toofanos" | "cubeverse" | "crowdera" | "agents" | "oss";
  title: string;
  category: string;
  blurb: string;
  tags: string[];
  live?: string;
  repo?: string;
  badge?: string;
};

export const work = {
  heading: "THINGS I'VE SHIPPED",
  sub: "A collection of experiments, products, and things I've brought to life.",
};

export const projects: Project[] = [
  {
    id: "toofanos",
    title: "ToofanOS",
    category: "Anticipatory action compiler",
    blurb:
      "From forecast to action before impact. A geospatial hazard-intelligence compiler that turns forecasts into time-bound, role-specific decisions and parametric triggers for coastal infrastructure.",
    tags: ["Geospatial", "Hazard intelligence", "Parametric triggers", "Coastal infrastructure"],
    live: "https://toofan-os.vercel.app/",
  },
  {
    id: "cubeverse",
    title: "CubeVerse",
    category: "Interactive 3D",
    blurb:
      "An interactive 3D cube experience in the browser, built on Three.js with a Firebase backend. Recognised at a hackathon.",
    tags: ["React", "Three.js", "WebGL", "Firebase"],
    live: "https://cubeverse-dev.vercel.app/",
    badge: "2nd runner-up",
  },
  {
    id: "crowdera",
    title: "Crowdera",
    category: "Collaborative product",
    blurb:
      "A relationship-focused platform built around storytelling, designed to encourage ongoing connections and return visits.",
    tags: ["Product", "Storytelling", "Web app"],
    live: "https://crowdera-new.vercel.app/",
    badge: "Finalist",
  },
  {
    id: "agents",
    title: "AI / Agent Experiments",
    category: "Research & prototypes",
    blurb:
      "A running log of experiments with LLMs, prompt optimization and agent workflows. Small systems built to understand how intelligent software actually behaves.",
    tags: ["LLMs", "AI agents", "Prompt optimization", "Python"],
  },
  {
    id: "oss",
    title: "Open Source",
    category: "Contributions",
    blurb:
      "Contributor to Kestra and Kubernetes, with multiple pull requests merged. Collaborating with global developer communities on workflow orchestration and cloud-native tooling.",
    tags: ["Kestra", "Kubernetes", "Git", "GitHub"],
    repo: "https://github.com/adishchowdhury",
  },
];

/** Smaller earlier builds, from the resume. */
export const earlier = [
  {
    title: "Facial Recognition Game",
    body: "An interactive game built on computer-vision concepts, focused on real-time input and user interaction.",
  },
  {
    title: "Emergency Ambulance Call Service",
    body: "A rapid-response system for quickly contacting ambulance services, built around accessibility and speed.",
  },
  {
    title: "Campus Connect",
    body: "A matching and social app for college students with campus-based matching and secure onboarding.",
  },
];

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

export const stack: {
  group: string;
  blurb: string;
  items: { name: string; note?: string }[];
}[] = [
  {
    group: "Programming",
    blurb: "Languages I think in",
    items: [{ name: "Java" }, { name: "Python" }, { name: "JavaScript" }, { name: "TypeScript" }],
  },
  {
    group: "Web",
    blurb: "Things that run in a browser",
    items: [
      { name: "React" },
      { name: "Next.js" },
      { name: "Node.js" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "Three.js", note: "CubeVerse" },
    ],
  },
  {
    group: "Databases",
    blurb: "Where the data lives",
    items: [{ name: "MongoDB" }, { name: "Firebase", note: "CubeVerse" }],
  },
  {
    group: "AI / Intelligent systems",
    blurb: "What I'm digging into",
    items: [
      { name: "LLMs" },
      { name: "AI agents" },
      { name: "Prompt engineering", note: "GoRoute" },
      { name: "Machine learning", note: "fundamentals" },
    ],
  },
  {
    group: "Engineering",
    blurb: "How it ships",
    items: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "Linux" },
      { name: "APIs" },
      { name: "Kubernetes", note: "open source" },
      { name: "Kestra", note: "open source" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Beyond the code                                                     */
/* ------------------------------------------------------------------ */

export type Category =
  | "Hackathons"
  | "Open source"
  | "Research & AI"
  | "Professional"
  | "Communities & learning"
  | "Honors";

export const categories: Category[] = [
  "Hackathons",
  "Open source",
  "Research & AI",
  "Professional",
  "Communities & learning",
  "Honors",
];

export const beyond: {
  category: Category;
  title: string;
  context: string;
  result?: string;
}[] = [
  { category: "Hackathons", title: "CubeVerse", context: "Hackathon build", result: "2nd runner-up" },
  { category: "Hackathons", title: "Crowdera", context: "Hackathon build", result: "Finalist" },
  { category: "Hackathons", title: "BotMan Begins — GenAI Challenge", context: "IIM", result: "2nd place, Round 1" },
  { category: "Hackathons", title: "Technocraft", context: "E-Weekend, Jadavpur University", result: "Finalist" },
  { category: "Hackathons", title: "Cyber CTF", context: "IIT Madras", result: "Finalist" },
  { category: "Hackathons", title: "Maths Olympiad, Source Code & Enigma", context: "Kshitij 2025, IIT Kharagpur", result: "Top 40 finalist" },
  { category: "Open source", title: "Kestra", context: "Workflow orchestration", result: "Multiple PRs merged" },
  { category: "Open source", title: "Kubernetes", context: "Cloud-native tooling", result: "Multiple PRs merged" },
  { category: "Research & AI", title: "AI & agent experiments", context: "LLMs, prompts and agent workflows", result: "Ongoing" },
  { category: "Research & AI", title: "AI system prompt optimization", context: "GoRoute", result: "Reviewed and optimized workflows" },
  { category: "Professional", title: "CEO & Co-Founder", context: "Threadpool — building a more capable workforce" },
  { category: "Professional", title: "Chief Technical Officer", context: "GoRoute — AI-powered travel management startup" },
  { category: "Professional", title: "Previously", context: "Nebius · freeCodeCamp · FlyRank.ai" },
  { category: "Communities & learning", title: "BS, Data Science & Applications", context: "IIT Madras, 2025–2029" },
  { category: "Communities & learning", title: "B.E., Information Technology", context: "Jadavpur University, 2025–2029" },
  { category: "Communities & learning", title: "Reliance Foundation Undergraduate Scholar", context: "Scholarship programme" },
  { category: "Communities & learning", title: "Competitive programming", context: "Codeforces", result: "Specialist" },
  { category: "Honors", title: "JEE Mains & JEE Advanced", context: "Qualified, among ~1.5 million and ~0.25 million candidates" },
  { category: "Honors", title: "WBJEE", context: "Qualified, among ~0.2 million candidates" },
  { category: "Honors", title: "National Cyber Olympiad", context: "Gold Medal of Distinction" },
  { category: "Honors", title: "International English Olympiad", context: "British Council", result: "2× silver medalist" },
  { category: "Honors", title: "Prabhat Khabar", context: "Featured in Indian newspapers for academic achievements" },
];

export const interests = [
  "Startup leadership and technical strategy",
  "Artificial intelligence and automation",
  "Open-source contribution and developer communities",
  "Competitive programming and hackathons",
];

/* ------------------------------------------------------------------ */
/* Hero stats — computed from the data above so they can never drift.  */
/* ------------------------------------------------------------------ */

export const stats = [
  { label: "Competitive programming", value: "Specialist", note: "on Codeforces" },
  {
    label: "Projects shipped",
    value: String(projects.filter((p) => p.live).length),
    note: "live on the web",
  },
  {
    label: "Hackathons & achievements",
    value: String(beyond.filter((b) => b.category === "Hackathons" || b.category === "Honors").length),
    note: "recognitions listed",
  },
  { label: "Technical interests", value: String(interests.length), note: "areas I keep going deeper in" },
];

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contact = {
  heading: ["GOT SOMETHING", "TO BUILD?"],
  sub: "I'm always interested in interesting ideas, ambitious projects, and conversations about technology.",
  cta: "Email me",
};
