import type {
  EnvVarSpec,
  FileMergeStrategy,
  GeneratedFile,
  GenerationRequest,
  GenerationResult,
} from '@forgestack/shared';
import type { ResolvedModule } from './resolver.js';
import type { TemplateSource } from './source.js';
import { render, type RenderContext } from './render.js';
import { FileCollisionError } from './errors.js';

interface ComposeInput {
  request: GenerationRequest;
  ordered: ResolvedModule[];
  templates: TemplateSource;
}

interface TrackedFile {
  file: GeneratedFile;
  writtenBy: string;
}

/**
 * Composes the resolved modules into a virtual project tree. Two files are
 * synthesized by the engine rather than templated, because they must merge
 * contributions from every module deterministically: `package.json` and
 * `.env.example`.
 */
export function compose(input: ComposeInput): GenerationResult {
  const { request, ordered, templates } = input;
  const warnings: string[] = [];
  const context = buildContext(request, ordered);

  const fileMap = new Map<string, TrackedFile>();
  const resolvedIds = new Set(ordered.map((m) => m.module.id));

  // Two passes so modifications (prepend/append) always apply on top of the base
  // files, regardless of module order — e.g. Tailwind prepending its import to a
  // framework's entry stylesheet after that file has been written.
  const isModification = (m: string) => m === 'prepend' || m === 'append';

  const emit = (accept: (merge: string) => boolean) => {
    for (const { module } of ordered) {
      for (const spec of module.files) {
        if (!accept(spec.merge)) continue;
        // `when` gate — only emit when the named option is truthy.
        if (spec.when && !isTruthyOption(request.options[spec.when])) continue;
        // `whenModule` gate — only emit when the named module is in the stack.
        if (spec.whenModule && !resolvedIds.has(spec.whenModule)) continue;

        const raw = resolveRawContent(spec, templates, module.id);
        const content = render(raw, context);
        const path = render(spec.path, context);

        applyFile(
          fileMap,
          { path, content, executable: spec.executable },
          spec.merge,
          module.id,
          warnings,
        );
      }
    }
  };

  emit((m) => !isModification(m)); // base files
  emit((m) => isModification(m)); // prepend/append on top

  // Synthesized, always-present files.
  const pkg = synthesizePackageJson(request, ordered, warnings);
  applyFile(fileMap, pkg, 'overwrite', '(engine)', warnings);

  const env = synthesizeEnvExample(ordered);
  if (env) applyFile(fileMap, env, 'skip-if-exists', '(engine)', warnings);

  const files = [...fileMap.values()]
    .map((t) => t.file)
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    projectName: request.projectName,
    resolvedModules: ordered.map((m) => m.module.id),
    files,
    warnings,
  };
}

/** A `when` gate passes when the option is boolean true or the string "true". */
function isTruthyOption(value: unknown): boolean {
  return value === true || value === 'true';
}

function buildContext(request: GenerationRequest, ordered: ResolvedModule[]): RenderContext {
  const moduleIds = ordered.map((m) => m.module.id);
  const moduleFlags: Record<string, boolean> = {};
  for (const id of moduleIds) moduleFlags[id.replace(/-/g, '_')] = true;

  return {
    projectName: request.projectName,
    description: request.description ?? '',
    packageManager: request.packageManager,
    options: request.options,
    modules: ordered.map((m) => ({ id: m.module.id, name: m.module.name })),
    moduleFlags,
    envVars: mergeEnvSpecs(ordered).map((spec) => ({
      key: spec.key,
      description: spec.description,
      zodExpr: zodExprFor(spec),
    })),
  };
}

/** Deduplicate env specs by key, preserving module (topological) order. */
function mergeEnvSpecs(ordered: ResolvedModule[]): EnvVarSpec[] {
  const seen = new Set<string>();
  const specs: EnvVarSpec[] = [];
  for (const { module } of ordered) {
    for (const spec of module.env) {
      if (seen.has(spec.key)) continue;
      seen.add(spec.key);
      specs.push(spec);
    }
  }
  return specs;
}

/**
 * Builds the Zod expression for a single env var. Centralising this here (vs.
 * in a template) keeps the generated `env.ts` trivial and the mapping tested.
 */
function zodExprFor(spec: EnvVarSpec): string {
  let expr: string;
  switch (spec.type) {
    case 'number':
      expr = 'z.coerce.number()';
      break;
    case 'port':
      expr = 'z.coerce.number().int().positive()';
      break;
    case 'url':
      expr = 'z.string().url()';
      break;
    case 'boolean':
      expr = "z.enum(['true', 'false']).transform((v) => v === 'true')";
      break;
    default:
      expr = 'z.string()';
  }

  const hasDefault = spec.default !== undefined && spec.default !== '';

  // A required, defaultless string must be non-empty to count as "provided".
  if (spec.type === 'string' && spec.required && !hasDefault) expr += '.min(1)';

  if (hasDefault) {
    if (spec.type === 'number' || spec.type === 'port') {
      expr += `.default(${Number(spec.default)})`;
    } else if (spec.type === 'boolean') {
      expr += `.default(${spec.default === 'true'})`;
    } else {
      expr += `.default('${spec.default}')`;
    }
  } else if (!spec.required) {
    expr += '.optional()';
  }

  return expr;
}

function resolveRawContent(
  spec: { content?: string; template?: string },
  templates: TemplateSource,
  moduleId: string,
): string {
  const hasContent = spec.content !== undefined;
  const hasTemplate = spec.template !== undefined;
  if (hasContent === hasTemplate) {
    throw new Error(
      `Module "${moduleId}" file must set exactly one of "content" or "template" (path: ${
        spec.template ?? '(inline)'
      }).`,
    );
  }
  return hasContent ? spec.content! : templates.read(spec.template!);
}

function applyFile(
  fileMap: Map<string, TrackedFile>,
  file: GeneratedFile,
  merge: FileMergeStrategy,
  moduleId: string,
  warnings: string[],
): void {
  const existing = fileMap.get(file.path);
  if (!existing) {
    // Nothing to merge into — prepend/append just create the file.
    fileMap.set(file.path, { file, writtenBy: moduleId });
    return;
  }

  switch (merge) {
    case 'overwrite':
      warnings.push(
        `File "${file.path}" from "${moduleId}" overwrote content from "${existing.writtenBy}".`,
      );
      fileMap.set(file.path, { file, writtenBy: moduleId });
      break;
    case 'skip-if-exists':
      // First writer wins; nothing to do.
      break;
    case 'error':
      throw new FileCollisionError(file.path, existing.writtenBy, moduleId);
    case 'prepend':
      fileMap.set(file.path, {
        file: { ...existing.file, content: file.content + existing.file.content },
        writtenBy: existing.writtenBy,
      });
      break;
    case 'append':
      fileMap.set(file.path, {
        file: { ...existing.file, content: existing.file.content + file.content },
        writtenBy: existing.writtenBy,
      });
      break;
  }
}

function synthesizePackageJson(
  request: GenerationRequest,
  ordered: ResolvedModule[],
  warnings: string[],
): GeneratedFile {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const scripts: Record<string, string> = {};
  let extra: Record<string, unknown> = {};

  const mergeDeps = (target: Record<string, string>, incoming: Record<string, string>) => {
    for (const [name, version] of Object.entries(incoming)) {
      if (target[name] && target[name] !== version) {
        warnings.push(
          `Dependency "${name}" requested as both ${target[name]} and ${version}; using ${version}.`,
        );
      }
      target[name] = version;
    }
  };

  for (const { module } of ordered) {
    mergeDeps(dependencies, module.packageJson.dependencies);
    mergeDeps(devDependencies, module.packageJson.devDependencies);
    Object.assign(scripts, module.packageJson.scripts);
    extra = { ...extra, ...module.packageJson.extra };
  }

  const pkg = {
    name: request.projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    ...(request.description ? { description: request.description } : {}),
    engines: { node: '>=20' },
    packageManager:
      request.packageManager === 'pnpm'
        ? 'pnpm@9.15.0'
        : request.packageManager === 'yarn'
          ? 'yarn@4.5.0'
          : undefined,
    scripts: sortRecord(scripts),
    dependencies: sortRecord(dependencies),
    devDependencies: sortRecord(devDependencies),
    ...extra,
  };

  return {
    path: 'package.json',
    content: JSON.stringify(pruneUndefined(pkg), null, 2) + '\n',
    executable: false,
  };
}

function synthesizeEnvExample(ordered: ResolvedModule[]): GeneratedFile | null {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const { module } of ordered) {
    const specs = module.env.filter((e) => !seen.has(e.key));
    if (specs.length === 0) continue;

    lines.push(`# ${module.name}`);
    for (const spec of specs) {
      seen.add(spec.key);
      lines.push(...renderEnvVar(spec));
    }
    lines.push('');
  }

  if (lines.length === 0) return null;

  return {
    path: '.env.example',
    content: lines.join('\n').trimEnd() + '\n',
    executable: false,
  };
}

function renderEnvVar(spec: EnvVarSpec): string[] {
  const out: string[] = [];
  const flags = [spec.required ? 'required' : 'optional', spec.type];
  out.push(`# ${spec.description} (${flags.join(', ')})`);
  const value = spec.secret ? '' : (spec.example ?? spec.default ?? '');
  out.push(`${spec.key}=${value}`);
  return out;
}

function sortRecord(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}
