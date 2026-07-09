import { describe, it, expect } from 'vitest';
import { render } from './render.js';

describe('render', () => {
  it('interpolates simple and dotted paths', () => {
    expect(render('Hello {{name}}!', { name: 'Fastify' })).toBe('Hello Fastify!');
    expect(render('{{a.b.c}}', { a: { b: { c: 42 } } })).toBe('42');
  });

  it('renders empty string for missing values', () => {
    expect(render('[{{missing}}]', {})).toBe('[]');
  });

  it('handles #if / #unless with array-aware truthiness', () => {
    expect(render('{{#if on}}Y{{/if}}', { on: true })).toBe('Y');
    expect(render('{{#if on}}Y{{/if}}', { on: false })).toBe('');
    expect(render('{{#if list}}has{{/if}}', { list: [] })).toBe('');
    expect(render('{{#unless list}}empty{{/unless}}', { list: [] })).toBe('empty');
  });

  it('iterates arrays with this/@index/@last', () => {
    const out = render('{{#each xs}}{{@index}}:{{this}}{{#unless @last}}, {{/unless}}{{/each}}', {
      xs: ['a', 'b', 'c'],
    });
    expect(out).toBe('0:a, 1:b, 2:c');
  });

  it('iterates arrays of objects and reads item properties', () => {
    const out = render('{{#each deps}}{{name}}@{{version}}\n{{/each}}', {
      deps: [
        { name: 'fastify', version: '5.0.0' },
        { name: 'zod', version: '3.24.1' },
      ],
    });
    expect(out).toBe('fastify@5.0.0\nzod@3.24.1\n');
  });

  it('supports nested blocks', () => {
    const out = render('{{#if show}}{{#each xs}}[{{this}}]{{/each}}{{/if}}', {
      show: true,
      xs: [1, 2],
    });
    expect(out).toBe('[1][2]');
  });

  it('throws on an unclosed block', () => {
    expect(() => render('{{#if x}}no end', {})).toThrow(/Unclosed block/);
  });
});
