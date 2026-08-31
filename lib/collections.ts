export interface Collection {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'best-ai-websites',
    title: 'Best AI Websites & Tools',
    description: 'Hand-picked artificial intelligence tools for writing, coding, art generation, and workflow automation.',
    icon: '🤖',
    category: 'AI Tools',
  },
  {
    slug: 'best-developer-websites',
    title: 'Best Websites for Developers',
    description: 'Essential developer tools, code repositories, documentation centers, and hosting platforms.',
    icon: '💻',
    category: 'Developer Tools',
  },
  {
    slug: 'best-productivity-websites',
    title: 'Best Productivity Websites',
    description: 'Top note-taking apps, diagramming whiteboards, task managers, and workflow utilities.',
    icon: '⚡',
    category: 'Productivity',
  },
  {
    slug: 'useful-websites',
    title: 'Useful Websites Everyone Should Know',
    description: 'A curated list of hidden gem utilities, privacy tools, file converters, and web essentials.',
    icon: '💎',
    category: 'Useful Web Resources',
  },
];
