const raw = import.meta.env.VITE_API_URL;

if (!raw) {
  const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';
  if (isProd) {
    throw new Error(
      'Falta la variable de entorno VITE_API_URL. Define la URL del backend en producción antes de desplegar.'
    );
  }
  console.warn('VITE_API_URL no definida. Usando http://localhost:3001/api/v1 (solo desarrollo).');
}

export const API_URL = raw ?? 'http://localhost:3001/api/v1';
