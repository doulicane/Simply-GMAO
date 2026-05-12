import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWorkOrders, useUpdateWorkOrderStatus } from './useWorkOrders'
import { QueryClientWrapper } from '@/test/test-utils'

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}))

import { fetchAPI } from '@/lib/api'

const mockedFetchAPI = vi.mocked(fetchAPI)

describe('useWorkOrders', () => {
  beforeEach(() => {
    mockedFetchAPI.mockReset()
  })

  it('fetches and maps work order list', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'wo-1',
          numero: 'BT-2025-001',
          title: 'Panne presse',
          status: 'EN_COURS',
          priority: 'HAUTE',
          type: 'corrective',
          equipmentId: 'eq-1',
          equipment: { name: 'Presse 1' },
          dateCreation: '2025-01-01T00:00:00Z',
        },
      ],
    })

    const { result } = renderHook(() => useWorkOrders(), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({
      id: 'wo-1',
      number: 'BT-2025-001',
      title: 'Panne presse',
      status: 'in_progress',
      priority: 'P2',
      type: 'corrective',
      equipmentName: 'Presse 1',
    })
  })

  it('updates work order status and maps correctly', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'wo-1',
        numero: 'BT-2025-001',
        title: 'Panne presse',
        status: 'CLOTURE',
        priority: 'HAUTE',
        type: 'corrective',
        equipmentId: 'eq-1',
        dateCreation: '2025-01-01T00:00:00Z',
      },
    })

    const { result } = renderHook(() => useUpdateWorkOrderStatus(), { wrapper: QueryClientWrapper })

    result.current.mutate({ id: 'wo-1', status: 'closed' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('closed')
  })
})
