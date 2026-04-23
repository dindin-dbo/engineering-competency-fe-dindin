import { http, HttpResponse } from 'msw'
import { mockUsers, mockTokens } from '@/mocks/data/users'

export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json() as Record<string, string>

    const exists = mockUsers.find(u => u.email === body.email)
    if (exists) {
      return HttpResponse.json(
        { error: { code: 'CONFLICT', message: 'Email already registered' } },
        { status: 409 }
      )
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'MERCHANT' as const,
    }
    mockUsers.push(newUser)

    return HttpResponse.json({
      data: {
        token: `mock-jwt-token-${newUser.id}`,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      },
    }, { status: 201 })
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as Record<string, string>

    const user = mockUsers.find(
      u => u.email === body.email && u.password === body.password
    )

    if (!user) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      data: {
        token: mockTokens[user.id] ?? `mock-jwt-${user.id}`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    })
  }),

  http.get('/api/v1/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    const token = auth?.replace('Bearer ', '')

    const userId = Object.entries(mockTokens).find(([, t]) => t === token)?.[0]
    const user = mockUsers.find(u => u.id === userId)

    if (!user) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  }),
]