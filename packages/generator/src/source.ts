/**
 * A TemplateSource resolves a `FileSpec.template` reference to raw template
 * text. Abstracting this keeps the generator engine pure and testable: the
 * templates package supplies a filesystem-backed implementation, while unit
 * tests use an in-memory map.
 */
export interface TemplateSource {
  read(templatePath: string): string;
  has(templatePath: string): boolean;
}

/** In-memory source, used by tests and any caller that already holds strings. */
export class MapTemplateSource implements TemplateSource {
  constructor(private readonly files: Record<string, string>) {}

  read(templatePath: string): string {
    const content = this.files[templatePath];
    if (content === undefined) {
      throw new Error(`Template "${templatePath}" not found in MapTemplateSource.`);
    }
    return content;
  }

  has(templatePath: string): boolean {
    return templatePath in this.files;
  }
}
