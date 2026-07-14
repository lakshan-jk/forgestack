/** Base class for every error the generator can raise, so callers (API) can
 *  map them to 4xx responses instead of 500s. */
export class GeneratorError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'GeneratorError';
    this.code = code;
  }
}

export class UnknownModuleError extends GeneratorError {
  constructor(public readonly moduleId: string, requiredBy?: string) {
    super(
      'UNKNOWN_MODULE',
      requiredBy
        ? `Module "${moduleId}" (required by "${requiredBy}") is not in the registry.`
        : `Module "${moduleId}" is not in the registry.`,
    );
    this.name = 'UnknownModuleError';
  }
}

export class ModuleConflictError extends GeneratorError {
  constructor(public readonly a: string, public readonly b: string) {
    super('MODULE_CONFLICT', `Modules "${a}" and "${b}" cannot be used together.`);
    this.name = 'ModuleConflictError';
  }
}

export class UnsatisfiedRequirementError extends GeneratorError {
  constructor(
    public readonly moduleId: string,
    public readonly requiresOneOf: string[],
  ) {
    super(
      'UNSATISFIED_REQUIREMENT',
      `Module "${moduleId}" requires one of: ${requiresOneOf.join(', ')}. Select one of them.`,
    );
    this.name = 'UnsatisfiedRequirementError';
  }
}

export class DependencyCycleError extends GeneratorError {
  constructor(public readonly cycle: string[]) {
    super('DEPENDENCY_CYCLE', `Dependency cycle detected: ${cycle.join(' → ')}.`);
    this.name = 'DependencyCycleError';
  }
}

export class FileCollisionError extends GeneratorError {
  constructor(public readonly path: string, a: string, b: string) {
    super(
      'FILE_COLLISION',
      `Modules "${a}" and "${b}" both emit "${path}" with merge strategy "error".`,
    );
    this.name = 'FileCollisionError';
  }
}
