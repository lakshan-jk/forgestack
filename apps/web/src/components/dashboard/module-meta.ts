import {
  Server,
  FileCode2,
  Database,
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
  type LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
}

/** Shared icon + accent per module category, used by the builder and templates. */
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

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY[category] ?? { icon: Layers, color: '#aab0bd' };
}
