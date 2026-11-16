import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

interface Props {
  id: string;
  label: string;
  error?: string;
  children: ReactNode; // the input; give it id={id}, aria-invalid and aria-describedby={`${id}-error`}
}

// Label + input + inline error message, styled by shadcn's Field.
export function FormField({ id, label, error, children }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

// Props to spread on the input so screen readers announce the error.
export function errorProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}
