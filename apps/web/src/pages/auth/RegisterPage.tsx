import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/AuthContext';
import { extractApiErrorMessage } from '../../services/apiClient';
import { Button, ErrorBanner, Input, Label } from '../../components/ui';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No se ha podido completar el registro.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-sky-700">ForecastIA</h1>
        <p className="mb-6 mt-1 text-center text-sm text-slate-500">Crea tu cuenta</p>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
