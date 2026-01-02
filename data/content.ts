export interface ExperienceItem {
  organization: string;
  location: string;
  period: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  href: string;
}

export interface WriteupItem {
  title: string;
  description: string;
  href: string;
  type: "writeup";
}

export const experience: ExperienceItem[] = [
  {
    organization: "Kundra",
    location: "Paris, FR",
    period: "2025 - Present",
    description: "Building AI-native HR tools as a founding engineer",
  },
  {
    organization: "Emote Care",
    location: "London, UK",
    period: "2024 - 2025",
    description: "Led a team of 7 through a full platform rebuild",
  },
  {
    organization: "Tour My India",
    location: "Noida, IN",
    period: "2019 - 2024",
    description:
      "Grew from engineer to lead, shipping AI tools and microservices",
  },
  {
    organization: "Pets World",
    location: "Noida, IN",
    period: "2021 - 2022",
    description: "Designed multi-vendor e-commerce serving 10k daily users",
  },
  {
    organization: "AlmsPay",
    location: "New Delhi, IN",
    period: "2019",
    description: "Built NGO discovery and automated bank disbursements",
  },
];

export const projects: ProjectItem[] = [
  {
    title: "Lattice: Graph-Augmented RAG",
    description:
      "Code intelligence that understands how your codebase actually connects",
    href: "https://github.com/iAmLakshya/Lattice",
  },
  {
    title: "ProjectM: Agentic Trader",
    description: "LLM-powered trading bot for perpetual futures on Hyperliquid",
    href: "https://github.com/iAmLakshya/ProjectM-Agentic-Trader",
  },
  {
    title: "Go-Tradebook",
    description:
      "Backtesting engine for trading strategies with OANDA integration",
    href: "https://github.com/iAmLakshya/go-tradebook",
  },
  {
    title: "Pitch Call AI Coach",
    description:
      "Full-duplex voice AI that roleplays as investors in real-time",
    href: "https://github.com/iAmLakshya/pitch-call-ai-coach",
  },
  {
    title: "ARCNET: Decentralised H-P2P",
    description: "Hierarchical peer-to-peer network with optimised discovery",
    href: "https://github.com/iAmLakshya/arcnet",
  },
  {
    title: "Wordle in Terminal",
    description: "The word guessing game, rebuilt for the terminal in Python",
    href: "https://gist.github.com/iAmLakshya/d77a0ab6fdf11690efbd2531b4455323",
  },
  {
    title: "NL-to-SQL Agent",
    description:
      "Claude and MCP tool that lets non-technical teams query data via Slack",
    href: "https://www.linkedin.com/in/lakshya-s-panwar/details/projects",
  },
  {
    title: "CERN BL4S: PMT Signal Analysis",
    description:
      "Deep learning for comparing photomultiplier tubes on the T9 beamline",
    href: "https://www.linkedin.com/in/lakshya-s-panwar/details/projects",
  },
  {
    title: "GODSEYE: Violence Detection",
    description:
      "Real-time threat detection in video streams using body language",
    href: "https://www.linkedin.com/in/lakshya-s-panwar/details/projects",
  },
  {
    title: "DeKrptos: Cryptic Hunt",
    description: "Online puzzle competition testing logic and lateral thinking",
    href: "https://www.linkedin.com/in/lakshya-s-panwar/details/projects",
  },
];

export const writeups: WriteupItem[] = [
  {
    title: "Building Scalable APIs",
    description: "A guide to designing REST APIs",
    href: "https://blog.iamlakshya.com/scalable-apis",
    type: "writeup",
  },
  {
    title: "React Performance Tips",
    description: "Optimizing React applications for speed",
    href: "https://blog.iamlakshya.com/react-performance",
    type: "writeup",
  },
  {
    title: "TypeScript Best Practices",
    description: "Writing clean and type-safe code",
    href: "https://blog.iamlakshya.com/typescript-tips",
    type: "writeup",
  },
];

export const socialLinks = {
  github: "https://github.com/iAmLakshya",
  linkedin: "https://www.linkedin.com/in/lakshya-s-panwar",
  email: "mailto:hello@iamlakshya.com",
  instagram: "https://www.instagram.com/laksh.ya",
  blog: "https://blog.iamlakshya.com",
};
