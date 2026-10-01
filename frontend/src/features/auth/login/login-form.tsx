import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EQUIPOS, getEquipo, setEquipo } from '../../../utils/equipo';
import { useAuth } from './auth-context';
import { LOGIN_MENSAJES, loginSchema } from './login-types';
import type { LoginErrorCode, LoginForm } from './login-types';

function mensajeDe(codigo: string): string {
  if (codigo === 'NETWORK_ERROR') {
    return 'No fue posible conectar con el servidor. Reintente.';
  }
  const key = codigo as keyof typeof LOGIN_MENSAJES;
  return LOGIN_MENSAJES[key] ?? 'Usuario o contraseña incorrectos.';
}

/** Formulario glassmorphism oscuro (diseño Yemheng Stitch, responsive). */
export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [verClave, setVerClave] = useState(false);
  const [equipo, setEquipoSel] = useState<string>(() => getEquipo());
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      setEquipo(equipo);
      const destino = await login(data);
      window.location.assign(destino);
    } catch (e) {
      setError(mensajeDe((e as Error).message as LoginErrorCode));
    }
  });

  return (
    <form onSubmit={onSubmit} className="relative space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-lg border border-[#ff8f8f]/30 bg-[#551010]/85 p-3 text-[#ffdad6] shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-[#ffb4ab]">error</span>
            <span className="text-xs leading-snug font-medium">{error}</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => setError(null)}
            className="rounded p-1 text-[#ffdad6]/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="logeo" className="block text-xs font-medium text-[#ffdcc3]">
          Usuario (Logeo) <span className="text-[#ffb4ab]">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#ffb77d]/70">
            person
          </span>
          <input
            id="logeo"
            type="text"
            autoComplete="username"
            placeholder="fran"
            {...register('logeo')}
            className="h-11 w-full rounded-lg border border-[#5b403d] bg-[#250d09]/90 pr-3.5 pl-10 text-sm text-[#fff4e8] shadow-inner transition-all outline-none placeholder:text-[#ab8985]/60 focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
          />
        </div>
        {errors.logeo && <p className="text-xs text-[#ffb4ab]">{errors.logeo.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="clave" className="block text-xs font-medium text-[#ffdcc3]">
          Contraseña <span className="text-[#ffb4ab]">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#ffb77d]/70">
            key
          </span>
          <input
            id="clave"
            type={verClave ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Ingresa tu clave secreta"
            {...register('clave')}
            className="h-11 w-full rounded-lg border border-[#5b403d] bg-[#250d09]/90 pr-11 pl-10 text-sm text-[#fff4e8] shadow-inner transition-all outline-none placeholder:text-[#ab8985]/60 focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
          />
          <button
            type="button"
            aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setVerClave((v) => !v)}
            className="absolute right-3 flex items-center justify-center rounded p-1 text-[#ffb77d]/70 transition-colors hover:text-[#ffdcc3]"
          >
            <span className="material-symbols-outlined text-lg">
              {verClave ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {errors.clave && <p className="text-xs text-[#ffb4ab]">{errors.clave.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 cursor-pointer rounded border-[#5b403d] bg-[#250d09] accent-[#b91c1c]"
          />
          <span className="text-xs text-[#ffdcc3]/90">Recordar sesión</span>
        </label>
        <span className="text-xs text-[#e4beb9]/70">¿Olvidaste tu contraseña? La gestiona tu administrador.</span>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="equipo" className="block text-xs font-medium text-[#ffdcc3]">
          Equipo <span className="font-normal text-[#e4beb9]/70">(opcional — si lo omites se usa la IP)</span>
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#ffb77d]/70">
            computer
          </span>
          <select
            id="equipo"
            value={equipo}
            onChange={(e) => setEquipoSel(e.target.value)}
            className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[#5b403d] bg-[#250d09]/90 pr-3.5 pl-10 text-sm text-[#fff4e8] shadow-inner transition-all outline-none focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
          >
            <option value="">Sin equipo (usa IP)</option>
            {EQUIPOS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#ff8f8f]/30 bg-[#b91c1c] text-xs font-semibold tracking-wider text-white shadow-[0_4px_16px_rgba(185,28,28,0.5)] transition-all duration-200 hover:bg-[#a01818] active:scale-[0.99] disabled:opacity-60"
        >
          <span>{isSubmitting ? 'INGRESANDO…' : 'INICIAR SESIÓN'}</span>
          <span className="text-sm font-bold">→</span>
        </button>
      </div>
    </form>
  );
}
