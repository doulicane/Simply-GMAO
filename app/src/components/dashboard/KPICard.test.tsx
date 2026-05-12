import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders title, value and subtitle', () => {
    render(<KPICard title="DISPONIBILITÉ" value="92.5" unit="%" subtitle="Objectif: 95%" borderColor="#22C55E" />)

    expect(screen.getByText('DISPONIBILITÉ')).toBeInTheDocument()
    expect(screen.getByText('92.5')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('Objectif: 95%')).toBeInTheDocument()
  })

  it('renders trend up and good', () => {
    render(
      <KPICard
        title="MTTR"
        value="2h30"
        subtitle="Moyenne 30 jours"
        borderColor="#0EA5E9"
        trend="+5%"
        trendUp={true}
        trendGood={true}
      />
    )

    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<KPICard title="BT" value="12" subtitle="ouverts" borderColor="#EF4444" onClick={handleClick} />)

    screen.getByText('BT').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
