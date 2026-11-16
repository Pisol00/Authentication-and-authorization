import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/api/client';
import AuthLayout from '@/components/AuthLayout';
import { errorProps, FormField } from '@/components/FormField';
import { PasswordInput } from '@/components/PasswordInput';
import { Input } from '@/components/ui/input';
import { getFieldErrors, loginFormSchema } from '@/lib/validation';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false); // show field errors only after the first submit
  const [error, setError] = useState(''); // error from the server
  const [submitting, setSubmitting] = useState(false);

  // Public page: show the form right away instead of waiting for /auth/me.
  // If it turns out the user is already logged in, `user` gets set and we redirect.
  if (user) return <Navigate to="/dashboard" replace />;

  // Re-checked on every render, so a message disappears as soon as the field is fixed.
  const errors = submitted ? getFieldErrors(loginFormSchema, { email, password }) : {};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    const result = loginFormSchema.safeParse({ email, password });
    if (!result.success) return; // field errors are shown inline

    setSubmitting(true);
    try {
      await login(result.data.email, result.data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account"
      submitLabel="Log in"
      submittingLabel="Logging in…"
      error={error}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={<>Don&apos;t have an account?&nbsp;<Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link></>}
    >
      <FormField id="email" label="Email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} {...errorProps('email', errors.email)} />
      </FormField>
      <FormField id="password" label="Password" error={errors.password}>
        <PasswordInput id="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} {...errorProps('password', errors.password)} />
      </FormField>
    </AuthLayout>
  );
}
