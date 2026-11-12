# Chifa Backend - Guía de Despliegue en Producción

## 1. Requisitos previos

- Node.js >= 20
- npm >= 10
- PM2 (instalado globalmente)
- Acceso SSH al servidor de producción
- Proyecto de Supabase configurado
- Proyecto de Sentry configurado (opcional, para monitoreo de errores)

---

## 2. Preparación del servidor

```bash
# Crear directorio de la aplicación
sudo mkdir -p /var/www/chifa-backend
sudo chown -R $USER:$USER /var/www/chifa-backend

# Crear directorio de logs
sudo mkdir -p /var/log/chifa-backend
sudo chown -R $USER:$USER /var/log/chifa-backend

# Instalar PM2 globalmente
npm install -g pm2

# Instalar pm2-logrotate para rotación de logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 3. Despliegue del código

```bash
# Clonar el repositorio (o copiar los archivos)
cd /var/www/chifa-backend

# Instalar dependencias
npm install --production

# Compilar TypeScript a JavaScript
npm run build

# Verificar que no hay errores de TypeScript
npm run typecheck
```

---

## 4. Variables de entorno

Copiar el archivo de ejemplo y editar con valores reales:

```bash
cp .env.production .env
```

Editar `.env` con los valores reales:
- `JWT_SECRET`: cambiar por una cadena aleatoria segura (mínimo 32 caracteres)
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio de Supabase
- `SENTRY_DSN`: DSN de tu proyecto Sentry (opcional pero recomendado)

---

## 5. Iniciar con PM2

```bash
# Iniciar la aplicación en modo producción
pm2 start ecosystem.config.js --env production

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar con el servidor
pm2 startup
```

Comandos útiles de PM2:

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs chifa-backend

# Ver solo errores
pm2 logs chifa-backend --err

# Reiniciar la aplicación
pm2 restart chifa-backend

# Detener la aplicación
pm2 stop chifa-backend

# Eliminar la aplicación de PM2
pm2 delete chifa-backend
```

---

## 6. Verificación del despliegue

```bash
# Probar el health check
curl http://localhost:3001/api/v1/health

# Respuesta esperada:
# {"ok":true,"db":true}
```

Si el health check responde `{"ok":true}`, la aplicación está funcionando correctamente.

---

## 7. Configuración de Nginx (proxy inverso)

Ejemplo de configuración para Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/health {
        proxy_pass http://localhost:3001/api/v1/health;
        access_log off;
    }
}
```

---

## 8. Checklist de despliegue

- [ ] `npm run build` compila sin errores de TypeScript
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm test` pasa todos los 270 tests (caja negra + blanca)
- [ ] Variables de entorno de producción configuradas en `.env`
- [ ] `SENTRY_DSN` configurado en producción (opcional pero recomendado)
- [ ] `LOG_FILE_PATH` apunta a un directorio con permisos de escritura
- [ ] PM2 iniciado con `--env production`
- [ ] Health check respondiendo 200 en `GET /api/v1/health`
- [ ] Logs fluyendo al archivo `/var/log/chifa-backend/app.log`
- [ ] PM2 configurado para iniciar con el servidor (`pm2 startup`)

---

## 9. Comandos de mantenimiento

```bash
# Ver todos los procesos de PM2
pm2 list

# Ver información detallada de la aplicación
pm2 info chifa-backend

# Reiniciar después de un cambio de código
pm2 restart chifa-backend

# Ver logs de errores
pm2 logs chifa-backend --err --lines 50

# Ver logs en tiempo real
pm2 logs chifa-backend --lines 100
```

---

## 10. Arquitectura de monitoreo

| Capa | Herramienta | Propósito |
|------|-------------|-----------|
| Logs estructurados | Pino + pino-http | Logs de requests, errores y auditoría de negocio |
| Almacenamiento de logs | PM2 + rotación | Archivos rotativos en `/var/log/chifa-backend/` |
| Monitoreo de errores | Sentry | Captura de excepciones no controladas |
| Métricas de uptime | Health check `/api/v1/health` | Verificación de disponibilidad |
| Revisión de logs | `pm2 logs` | Diagnóstico en tiempo real |

---

## 11. Comandos rápidos

```bash
# Despliegue completo desde cero
npm install --production
npm run build
npm run typecheck
npm test
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Verificar estado
pm2 status
curl http://localhost:3001/api/v1/health

# Reiniciar después de cambios
pm2 restart chifa-backend
```
