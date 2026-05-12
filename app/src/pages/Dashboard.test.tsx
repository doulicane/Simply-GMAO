import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/components/dashboard/TechnicienDashboard', () => ({
  TechnicienDashboard: () => <div data-testid="tech-dashboard">TechnicienDashboard</div>,
}))

vi.mock('@/components/dashboard/ResponsableDashboard', () => ({
  ResponsableDashboard: () => <div data-testid="resp-dashboard">ResponsableDashboard</div>,
}))

import { useAuthStore } from '@/stores/authStore'

const mockedUseAuthStore = vi.mocked(useAuthStore)

describe('Dashboard', () => {
  it('renders TechnicienDashboard for technicien role', () => {
    mockedUseAuthStore.mockReturnValue({ user: { role: 'technicien' } } as ReturnType<typeof useAuthStore>)

    render(<Dashboard />)
    expect(screen.getByTestId('tech-dashboard')).toBeInTheDocument()
  })

  it('renders ResponsableDashboard for responsable role', () => {
    mockedUseAuthStore.mockReturnValue({ user: { role: 'RESPONSABLE' } } as ReturnType<typeof useAuthStore>)

    render(<Dashboard />)
    expect(screen.getByTestId('resp-dashboard')).toBeInTheDocument()
  })

  it('renders ResponsableDashboard when no user', () => {
    mockedUseAuthStore.mockReturnValue({ user: null } as unknown as ReturnType<typeof useAuthStore>)

    render(<Dashboard />)
    expect(screen.getByTestId('resp-dashboard')).toBeInTheDocument()
  })
})
