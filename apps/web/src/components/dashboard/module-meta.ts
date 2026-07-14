import {
  Server,
  FileCode2,
  Database,
  Cylinder,
  Zap,
  Layers,
  Sparkles,
  KeyRound,
  BookOpen,
  ShieldCheck,
  Container,
  Wrench,
  Component,
  Palette,
  Rocket,
  Leaf,
  Bot,
  Network,
  Wind,
  Workflow,
  CircleCheck,
  Wand2,
  Dog,
  GitCommitHorizontal,
  FlaskConical,
  Hexagon,
  Triangle,
  Atom,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
}

/** Icon + accent per category (fallback for modules without a specific icon). */
const CATEGORY: Record<string, CategoryMeta> = {
  framework: { icon: Component, color: '#ff85c0' },
  language: { icon: FileCode2, color: '#4f9dff' },
  core: { icon: Server, color: '#8b7cff' },
  database: { icon: Database, color: '#3fd07f' },
  cache: { icon: Zap, color: '#ff6b6b' },
  queue: { icon: Layers, color: '#f7c948' },
  ai: { icon: Sparkles, color: '#b06bff' },
  ui: { icon: Palette, color: '#22d3ee' },
  auth: { icon: KeyRound, color: '#ffa94d' },
  docs: { icon: BookOpen, color: '#5aa2ff' },
  security: { icon: ShieldCheck, color: '#63e6be' },
  devops: { icon: Container, color: '#74c0fc' },
  quality: { icon: Wrench, color: '#aab0bd' },
};

/** Distinct icon + accent per module, so no two look alike in a list. */
const MODULE: Record<string, CategoryMeta> = {
  typescript: { icon: FileCode2, color: '#3178c6' },
  fastify: { icon: Rocket, color: '#8b7cff' },
  nest: { icon: Hexagon, color: '#e0234e' },
  'nest-essentials': { icon: ShieldCheck, color: '#e0234e' },
  next: { icon: Triangle, color: '#cbd5e1' },
  'next-js': { icon: Triangle, color: '#f7df1e' },
  react: { icon: Atom, color: '#61dafb' },
  'react-js': { icon: Atom, color: '#f7df1e' },
  vite: { icon: Zap, color: '#bd34fe' },
  mongodb: { icon: Leaf, color: '#47a248' },
  prisma: { icon: Cylinder, color: '#5a67d8' },
  redis: { icon: Database, color: '#ff6b6b' },
  bullmq: { icon: Layers, color: '#f7c948' },
  jwt: { icon: KeyRound, color: '#fb015b' },
  swagger: { icon: BookOpen, color: '#85ea2d' },
  ollama: { icon: Bot, color: '#b06bff' },
  qdrant: { icon: Network, color: '#ff85c0' },
  rag: { icon: Sparkles, color: '#a855f7' },
  tailwind: { icon: Wind, color: '#38bdf8' },
  docker: { icon: Container, color: '#2496ed' },
  'github-actions': { icon: Workflow, color: '#cbd5e1' },
  eslint: { icon: CircleCheck, color: '#8080f2' },
  prettier: { icon: Wand2, color: '#f7b93e' },
  husky: { icon: Dog, color: '#e8a33d' },
  commitlint: { icon: GitCommitHorizontal, color: '#f7c948' },
  vitest: { icon: FlaskConical, color: '#fcc72b' },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY[category] ?? { icon: Layers, color: '#aab0bd' };
}

/** Per-module icon/accent, falling back to the category icon for unknown ids. */
export function moduleMeta(id: string, category: string): CategoryMeta {
  return MODULE[id] ?? categoryMeta(category);
}
