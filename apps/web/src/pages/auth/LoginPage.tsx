import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/AuthContext';
import { extractApiErrorMessage } from '../../services/apiClient';
import { Button, ErrorBanner, Input, Label } from '../../components/ui';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo@forecastia.app');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No se ha podido iniciar sesión.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-sky-700">ForecastIA</h1>
        <p className="mb-6 mt-1 text-center text-sm text-slate-500">Inicia sesión para continuar</p>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Accediendo...' : 'Acceder'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Usuario de prueba: demo@forecastia.app / Demo1234!
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-sky-600 hover:text-sky-700">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
