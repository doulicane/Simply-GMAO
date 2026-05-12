import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useEquipments, useEquipment, useCreateEquipment } from './useEquipments'
import { QueryClientWrapper } from '@/test/test-utils'

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}))

import { fetchAPI } from '@/lib/api'

const mockedFetchAPI = vi.mocked(fetchAPI)

describe('useEquipments', () => {
  beforeEach(() => {
    mockedFetchAPI.mockReset()
  })

  it('fetches and maps equipment list', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'eq-1',
          code: 'P001',
          name: 'Presse 1',
          type: 'presse',
          statut: 'EN_SERVICE',
          criticality: 'CRITIQUE',
          ligne: { name: 'L1', zone: { name: 'Z1' } },
        },
      ],
    })

    const { result } = renderHook(() => useEquipments(), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({
      id: 'eq-1',
      code: 'P001',
      name: 'Presse 1',
      type: 'presse',
      status: 'running',
      criticality: 'critique',
      line: 'L1',
      location: 'Z1',
    })
  })

  it('fetches single equipment', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'eq-1',
        code: 'P001',
        name: 'Presse 1',
        type: 'presse',
        statut: 'EN_ARRET',
        criticality: 'ELEVEE',
      },
    })

    const { result } = renderHook(() => useEquipment('eq-1'), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.status).toBe('stopped')
    expect(result.current.data?.criticality).toBe('elevee')
  })

  it('creates equipment and invalidates list', async () => {
    mockedFetchAPI.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'eq-new',
        code: 'P002',
        name: 'Presse 2',
        type: 'presse',
        statut: 'EN_SERVICE',
        criticality: 'MOYENNE',
      },
    })

    const { result } = renderHook(() => useCreateEquipment(), { wrapper: QueryClientWrapper })

    result.current.mutate({ code: 'P002', name: 'Presse 2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.code).toBe('P002')
  })
})
