import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Collapse, useLastMessage } from '@/components/Motion';

interface Props {
  id: string;
  label: string;
  error?: string;
  children: ReactNode; // the input; give it id={id}, aria-invalid and aria-describedby={`${id}-error`}
}

// Label + input + inline error message, styled by shadcn's Field.
export function FormField({ id, label, error, children }: Props) {
  const shownError = useLastMessage(error);
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      <Collapse show={!!error}>
        <FieldError id={`${id}-error`}>{shownError}</FieldError>
      </Collapse>
    </Field>
  );
}

// Props to spread on the input so screen readers announce the error.
export function errorProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}
