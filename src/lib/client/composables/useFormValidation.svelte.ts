import { z } from "zod";

export class FormValidationManager<T extends z.ZodType<any, any, any>> {
  schema: T;
  errors = $state<Record<string, string>>({});

  constructor(schema: T) {
    this.schema = schema;
  }

  validate(data: unknown): data is z.infer<T> {
    this.errors = {};
    const result = this.schema.safeParse(data);
    if (result.success) {
      return true;
    }

    const newErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      newErrors[path] = issue.message;
    }
    this.errors = newErrors;

    // A11y: Programmatic focus shift to the first invalid element
    if (typeof document !== "undefined") {
      setTimeout(() => {
        const invalidEl = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
        if (invalidEl) {
          invalidEl.focus();
        }
      }, 0);
    }

    return false;
  }

  clear() {
    this.errors = {};
  }
}

export function useFormValidation<T extends z.ZodType<any, any, any>>(schema: T) {
  return new FormValidationManager(schema);
}
