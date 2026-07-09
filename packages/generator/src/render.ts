/**
 * A tiny, dependency-free template renderer — a deliberate subset of
 * Handlebars sufficient for code generation. We avoid a real templating
 * library so the engine stays pure and the generated output is 100%
 * predictable.
 *
 * Supported syntax:
 *   {{ path.to.value }}        interpolation (NOT html-escaped — we emit code)
 *   {{#if path}} … {{/if}}     block, renders when the value is truthy
 *   {{#unless path}} … {{/unless}}
 *   {{#each items}} … {{/each}} with {{this}}, {{@index}}, {{@first}}, {{@last}}
 *
 * Truthiness follows JS, except empty arrays are falsy (so {{#if list}} works).
 */

export type RenderContext = Record<string, unknown>;

type Node =
  | { type: 'text'; value: string }
  | { type: 'var'; path: string }
  | { type: 'if' | 'unless'; path: string; body: Node[] }
  | { type: 'each'; path: string; body: Node[] };

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'tag'; value: string };

const TAG = /\{\{([^}]+)\}\}/g;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of input.matchAll(TAG)) {
    const idx = m.index;
    if (idx > last) tokens.push({ kind: 'text', value: input.slice(last, idx) });
    tokens.push({ kind: 'tag', value: m[1]!.trim() });
    last = idx + m[0].length;
  }
  if (last < input.length) tokens.push({ kind: 'text', value: input.slice(last) });
  return tokens;
}

/** Recursive-descent parse into an AST. `stopAt` closes the current block. */
function parse(tokens: Token[], start: number, stopAt: string | null): [Node[], number] {
  const nodes: Node[] = [];
  let i = start;

  while (i < tokens.length) {
    const tok = tokens[i]!;

    if (tok.kind === 'text') {
      nodes.push({ type: 'text', value: tok.value });
      i += 1;
      continue;
    }

    const tag = tok.value;

    if (stopAt && tag === stopAt) {
      return [nodes, i + 1]; // consume the closing tag
    }

    if (tag.startsWith('#if ') || tag.startsWith('#unless ') || tag.startsWith('#each ')) {
      const [keyword, ...rest] = tag.slice(1).split(/\s+/);
      const path = rest.join(' ');
      const close = `/${keyword}`;
      const [body, next] = parse(tokens, i + 1, close);
      nodes.push({ type: keyword as 'if' | 'unless' | 'each', path, body });
      i = next;
      continue;
    }

    if (tag.startsWith('/')) {
      throw new Error(`Unexpected closing tag "{{${tag}}}" in template.`);
    }

    nodes.push({ type: 'var', path: tag });
    i += 1;
  }

  if (stopAt) throw new Error(`Unclosed block, expected "{{${stopAt}}}".`);
  return [nodes, i];
}

interface Scope {
  root: RenderContext;
  item?: unknown;
  meta?: { index: number; first: boolean; last: boolean };
}

function lookup(path: string, scope: Scope): unknown {
  if (path === 'this') return scope.item ?? scope.root;
  if (path.startsWith('@')) {
    const key = path.slice(1);
    if (scope.meta && key in scope.meta) return (scope.meta as Record<string, unknown>)[key];
    return undefined;
  }

  const segments = path.split('.');
  // Prefer the loop item when it's an object that owns the first segment.
  let current: unknown =
    scope.item && typeof scope.item === 'object' && segments[0]! in (scope.item as object)
      ? scope.item
      : scope.root;

  for (const seg of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

function truthy(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function renderNodes(nodes: Node[], scope: Scope): string {
  let out = '';

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        out += node.value;
        break;
      case 'var': {
        const v = lookup(node.path, scope);
        out += v == null ? '' : String(v);
        break;
      }
      case 'if':
        if (truthy(lookup(node.path, scope))) out += renderNodes(node.body, scope);
        break;
      case 'unless':
        if (!truthy(lookup(node.path, scope))) out += renderNodes(node.body, scope);
        break;
      case 'each': {
        const list = lookup(node.path, scope);
        if (Array.isArray(list)) {
          list.forEach((item, index) => {
            out += renderNodes(node.body, {
              root: scope.root,
              item,
              meta: { index, first: index === 0, last: index === list.length - 1 },
            });
          });
        }
        break;
      }
    }
  }

  return out;
}

export function render(template: string, context: RenderContext): string {
  const [nodes] = parse(tokenize(template), 0, null);
  return renderNodes(nodes, { root: context });
}
