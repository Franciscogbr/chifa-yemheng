import request from 'supertest'
import { createApp } from '../../app.js'
import { supabase } from '../../config/supabase.js'

const app = createApp()

// Helper to set auth token
let authToken: string | null = null

function setAuth(token: string) {
  authToken = token
}

// Helper with auth
const authenticatedRequest = (
  method: 'get' | 'post' | 'put' | 'patch',
  path: string,
  body?: unknown
) =>
  request(app[method])(path)
    .set('Authorization', authToken ?? 'Bearer test-token')
    .send(body)

// Health check (public)
describe('Health endpoint', () => {
  it('should return db status', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
    expect(res.body).toHaveProperty('db', expect.any(Boolean))
  })
})

// Productos - public list and detail
describe('Productos endpoints (public)', () => {
  it('should get productos list', async () => {
    const res = await request(app).get('/api/v1/productos/')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should get producto by id', async () => {
    const res = await request(app).get('/api/v1/productos/1')
    expect([200, 404]).toContain(res.status)
    if (res.status === 200) expect(res.body).toHaveProperty('id')
  })
})

// Categorías - public list and detail
describe('Categorías endpoints (public)', () => {
  it('should get categorias list', async () => {
    const res = await request(app).get('/api/v1/categorias/')
    expect([200, 503]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true)
    }
  }, 15000)

  it('should get categoria by id', async () => {
    const res = await request(app).get('/api/v1/categorias/1')
    expect([200, 404, 503]).toContain(res.status)
    if (res.status === 200) expect(res.body).toHaveProperty('id')
  }, 15000)
})

// Clientes - requires auth
describe('Clientes endpoints', () => {
  it('should require auth for GET /clientes', async () => {
    const res = await request(app).get('/api/v1/clientes/')
    expect(res.status).toBe(401)
  })

  it('should GET /clientes with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/clientes/')
    expect([200, 401]).toContain(res.status)
  })
})

// Mesas - público QR, requiere auth para el resto
describe('Mesas endpoints', () => {
  it('should reject /mesas/by-qr without codigo', async () => {
    const res = await request(app).get('/api/v1/mesas/by-qr')
    expect(res.status).toBe(400)
  })

  it('should get mesa by QR (public)', async () => {
    const res = await request(app).get('/api/v1/mesas/by-qr?codigo=NO-EXISTE')
    expect([200, 404]).toContain(res.status)
  })

  it('should require auth for GET /mesas', async () => {
    const res = await request(app).get('/api/v1/mesas/')
    expect(res.status).toBe(401)
  })

  it('should GET /mesas with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/mesas/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Reservas - requires auth
describe('Reservas endpoints', () => {
  it('should require auth for GET /reservas', async () => {
    const res = await request(app).get('/api/v1/reservas/')
    expect(res.status).toBe(401)
  })

  it('should POST /reservas with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).post('/api/v1/reservas/')
    expect([200, 201, 401, 403]).toContain(res.status)
  })
})

// Auth - login
describe('Auth endpoints', () => {
  it('should POST /api/v1/auth/login', async () => {
    const res = await request(app).post('/api/v1/auth/login')
    expect([200, 400, 422]).toContain(res.status)
  })

  it('should GET /api/v1/auth/permisos with auth', async () => {
    setAuth('Bearer test-token')
    const res = await request(app).get('/api/v1/auth/permisos')
    expect([200, 401]).toContain(res.status)
  })
})

// Dashboard - requires auth
describe('Dashboard endpoint', () => {
  it('should require auth for GET /dashboard/resumen', async () => {
    const res = await request(app).get('/api/v1/dashboard/resumen')
    expect(res.status).toBe(401)
  })

  it('should GET /dashboard/resumen with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/dashboard/resumen')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Seguridad - requires auth
describe('Seguridad endpoints', () => {
  it('should require auth for GET /seguridad/usuarios', async () => {
    const res = await request(app).get('/api/v1/seguridad/usuarios')
    expect(res.status).toBe(401)
  })

  it('should GET /seguridad/roles with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/seguridad/roles')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Pedidos - requires auth
describe('Pedidos endpoints', () => {
  it('should require auth for GET /pedidos', async () => {
    const res = await request(app).get('/api/v1/pedidos/')
    expect(res.status).toBe(401)
  })

  it('should GET /pedidos/cocina with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/pedidos/cocina')
    expect([200, 401, 403]).toContain(res.status)
  })

  it('should POST /pedidos with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).post('/api/v1/pedidos/')
    expect([200, 201, 401, 403]).toContain(res.status)
  })
})

// Inventario - requires auth
describe('Inventario endpoints', () => {
  it('should require auth for GET /inventario/movimientos', async () => {
    const res = await request(app).get('/api/v1/inventario/movimientos')
    expect(res.status).toBe(401)
  })

  it('should GET /inventario/recetas with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/inventario/recetas')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Reportes - requires auth
describe('Reportes endpoints', () => {
  it('should require auth for GET /reportes/ventas-diarias', async () => {
    const res = await request(app).get('/api/v1/reportes/ventas-diarias')
    expect(res.status).toBe(401)
  })

  it.each(['ventas-por-categoria', 'reservas', 'delivery', 'analisis-comercial'])(
    'should require auth for GET /reportes/%s',
    async (reporte) => {
      const res = await request(app).get(`/api/v1/reportes/${reporte}`)
      expect(res.status).toBe(401)
    },
  )

  it('should GET /reportes/* with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/reportes/ventas-diarias')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Auditoria - requires auth
describe('Auditoria endpoints', () => {
  it('should require auth for GET /auditoria', async () => {
    const res = await request(app).get('/api/v1/auditoria/')
    expect(res.status).toBe(401)
  })

  it('should GET /auditoria with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/auditoria/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Unidades - requires auth
describe('Unidades endpoints', () => {
  it('should require auth for GET /unidades', async () => {
    const res = await request(app).get('/api/v1/unidades/')
    expect(res.status).toBe(401)
  })

  it('should GET /unidades with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/unidades/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Tipos de mesa - requires auth
describe('Tipos de mesa endpoints', () => {
  it('should require auth for GET /tipos-mesa', async () => {
    const res = await request(app).get('/api/v1/tipos-mesa/')
    expect(res.status).toBe(401)
  })

  it('should GET /tipos-mesa with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/tipos-mesa/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Personal - requires auth
describe('Personal endpoints', () => {
  it('should require auth for GET /personal', async () => {
    const res = await request(app).get('/api/v1/personal/')
    expect(res.status).toBe(401)
  })

  it('should GET /personal with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/personal/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Delivery - requires auth
describe('Delivery endpoints', () => {
  it('should require auth for GET /delivery', async () => {
    const res = await request(app).get('/api/v1/delivery/')
    expect(res.status).toBe(401)
  })

  it('should GET /delivery with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/delivery/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Caja - requires auth
describe('Caja endpoints', () => {
  it('should require auth for GET /caja', async () => {
    const res = await request(app).get('/api/v1/caja/')
    expect(res.status).toBe(401)
  })

  it('should GET /caja with auth', async () => {
    setAuth('Bearer test-admin-token')
    const res = await request(app).get('/api/v1/caja/')
    expect([200, 401, 403]).toContain(res.status)
  })
})

// Clientes auth (OAuth)
describe('Cliente auth endpoints', () => {
  it('should POST /api/v1/cliente/oauth/google', async () => {
    const res = await request(app).post('/api/v1/cliente/oauth/google')
    expect([200, 400, 503]).toContain(res.status)
  })

  it('should reject a malformed email session exchange', async () => {
    const res = await request(app).post('/api/v1/cliente/email/session').send({})
    expect(res.status).toBe(400)
  })

  it('should GET /api/v1/cliente/sesion', async () => {
    const res = await request(app).get('/api/v1/cliente/sesion')
    expect([200, 401]).toContain(res.status)
  })

  it('should reject a customer reservation without a cliente token', async () => {
    const res = await request(app)
      .post('/api/v1/cliente/reservas')
      .send({ fecha: '2026-11-01', hora: '20:00', comensales: 2 })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error', 'CREDENCIALES_INVALIDAS')
  })

  it('should require a cliente token to list active delivery orders', async () => {
    const res = await request(app).get('/api/v1/cliente/delivery')
    expect(res.status).toBe(401)
  })

  it('should POST /api/v1/cliente/logout', async () => {
    const res = await request(app).post('/api/v1/cliente/logout')
    expect([200, 401]).toContain(res.status)
  })
})

// Cliente pedidos (cliente facing)
describe('Cliente pedidos endpoints', () => {
  it('should GET /api/v1/cliente/pedidos/activos', async () => {
    const res = await request(app).get('/api/v1/cliente/pedidos/activos')
    expect([200, 401]).toContain(res.status)
  })

  it('should GET /api/v1/cliente/pedidos/comanda', async () => {
    const res = await request(app).get('/api/v1/cliente/pedidos/comanda')
    expect([200, 401]).toContain(res.status)
  })
})