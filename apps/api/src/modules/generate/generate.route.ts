import type { FastifyInstance } from 'fastify';
import { generateProject, zipProject } from '@forgestack/generator';
import { TelemetryEventName } from '@forgestack/telemetry';
import { registry, templates } from '../../lib/generator.js';
import { telemetry } from '../../lib/telemetry.js';

/**
 * The generation API — the product's core deliverable.
 *
 *   GET  /api/modules   list the available modules (drives the stack builder UI)
 *   POST /api/generate  compose a project and stream it back as a ZIP download
 */
export async function generateRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/modules', async () => {
    const modules = registry.list().map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      required: m.required,
      dependsOn: m.dependsOn,
      conflictsWith: m.conflictsWith,
      provides: m.provides,
      tags: m.tags,
    }));
    return { modules };
  });

  app.post('/api/generate', async (request, reply) => {
    // generateProject validates the body (zod) and resolves the module graph;
    // invalid input throws and is mapped to a 400 by the global error handler.
    const result = generateProject(request.body, { registry, templates });
    const archive = zipProject(result);

    // Anonymous: which modules, not who or what they named it.
    telemetry.track(TelemetryEventName.ProjectGenerated, {
      modules: result.resolvedModules,
      moduleCount: result.resolvedModules.length,
    });

    return reply
      .header('Content-Type', 'application/zip')
      .header('Content-Disposition', `attachment; filename="${result.projectName}.zip"`)
      .header('X-ForgeStack-Modules', result.resolvedModules.join(','))
      .send(Buffer.from(archive));
  });
}
