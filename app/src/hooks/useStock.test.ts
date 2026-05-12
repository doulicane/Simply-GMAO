import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStockItems, useStockItem, useCreateStockMovement } from './useStock'
import { QueryClientWrapper } from '@/test/test-utils'

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}))

import { fetchAPI } from '@/lib/api'

const mockedFetchAPI = vi.mocked(fetchAPI)

describe('useStock', () => {
  beforeEach(() => {
    mockedFetchAPI.mockReset()
  })

  it('fetches stock items and maps status low', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'stk-1',
          code: 'PIE-001',
          name: 'Roulement',
          famille: 'Mecanique',
          quantite: 2,
          stockMinimum: 5,
          unite: 'pc',
        },
      ],
    })

    const { result } = renderHook(() => useStockItems(), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({
      id: 'stk-1',
      code: 'PIE-001',
      name: 'Roulement',
      quantity: 2,
      minStock: 5,
      status: 'low',
    })
  })

  it('fetches single stock item with movements', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'stk-1',
        code: 'PIE-001',
        name: 'Roulement',
        quantite: 10,
        stockMinimum: 5,
        stockMovements: [
          { id: 'mv-1', type: 'ENTREE', quantite: 10, date: '2025-01-01T00:00:00Z' },
        ],
      },
    })

    const { result } = renderHook(() => useStockItem('stk-1'), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.quantity).toBe(10)
    expect(result.current.data?.movements).toHaveLength(1)
    expect(result.current.data?.movements[0].type).toBe('ENTREE')
  })

  it('creates stock movement', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: { id: 'mv-1', type: 'SORTIE', quantite: 2 },
    })

    const { result } = renderHook(() => useCreateStockMovement(), { wrapper: QueryClientWrapper })

    result.current.mutate({ stockItemId: 'stk-1', type: 'SORTIE', quantite: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.type).toBe('SORTIE')
  })
})
