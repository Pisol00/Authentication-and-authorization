import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/api/client';
import AuthLayout from '@/components/AuthLayout';
import { errorProps, FormField } from '@/components/FormField';
import { PasswordInput } from '@/components/PasswordInput';
import { Input } from '@/components/ui/input';
import { getFieldErrors, registerFormSchema } from '@/lib/validation';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false); // show field errors only after the first submit
  const [error, setError] = useState(''); // error from the server, e.g. "Email already registered"
  const [submitting, setSubmitting] = useState(false);

  // Public page: show the form right away instead of waiting for /auth/me.
  // If it turns out the user is already logged in, `user` gets set and we redirect.
  if (user) return <Navigate to="/dashboard" replace />;

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  // Re-checked on every render, so a message disappears as soon as the field is fixed.
  const errors = submitted ? getFieldErrors(registerFormSchema, values) : {};
  // The confirmation is checked live, even before the first submit.
  const confirmError =
    errors.confirmPassword ??
    (values.confirmPassword && values.confirmPassword !== values.password ? 'Passwords do not match' : undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    const result = registerFormSchema.safeParse(values);
    if (!result.success) return; // field errors are shown inline

    setSubmitting(true);
    try {
      await register(result.data.name, result.data.email, result.data.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started in a few seconds"
      submitLabel="Create account"
      submittingLabel="Creating account…"
      error={error}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={<>Already have an account?&nbsp;<Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link></>}
    >
      <FormField id="name" label="Name" error={errors.name}>
        <Input id="name" autoComplete="name" placeholder="Jane Doe" value={values.name} onChange={set('name')} {...errorProps('name', errors.name)} />
      </FormField>
      <FormField id="email" label="Email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set('email')} {...errorProps('email', errors.email)} />
      </FormField>
      <FormField id="password" label="Password" error={errors.password}>
        <PasswordInput id="password" autoComplete="new-password" placeholder="At least 6 characters" value={values.password} onChange={set('password')} {...errorProps('password', errors.password)} />
      </FormField>
      <FormField id="confirm-password" label="Confirm password" error={confirmError}>
        <PasswordInput id="confirm-password" autoComplete="new-password" placeholder="Re-enter your password" value={values.confirmPassword} onChange={set('confirmPassword')} {...errorProps('confirm-password', confirmError)} />
      </FormField>
    </AuthLayout>
  );
}
