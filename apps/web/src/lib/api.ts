import type { GenerationRequest } from '@forgestack/shared';

/** The control-plane API base URL. Overridable for staging/prod. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** A module as exposed by GET /api/modules (a public subset of ModuleDefinition). */
export interface ApiModule {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  dependsOn: string[];
  conflictsWith: string[];
  provides: string[];
  tags: string[];
}

export async function fetchModules(): Promise<ApiModule[]> {
  const res = await fetch(`${API_URL}/api/modules`);
  if (!res.ok) throw new Error(`Failed to load modules (${res.status})`);
  const data = (await res.json()) as { modules: ApiModule[] };
  return data.modules;
}

export interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

/** Thrown when the API rejects a generation request (e.g. 400 validation). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly issues: ValidationIssue[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** POST /api/generate → triggers a browser download of the project ZIP. */
export async function generateAndDownload(request: GenerationRequest): Promise<void> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    let issues: ValidationIssue[] = [];
    let message = `Generation failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string; issues?: ValidationIssue[] };
      if (body.issues) issues = body.issues;
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, issues);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${request.projectName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
