import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SystemHealthPanel } from './SystemHealthPanel'
import { SystemHealthMetrics } from '@/data/mockData'
import * as fc from 'fast-check'
import { TooltipProvider } from '@/components/ui/tooltip'

// Helper to wrap component with TooltipProvider
const renderWithTooltip = (component: React.ReactElement) => {
    return render(
        <TooltipProvider>
            {component}
        </TooltipProvider>
    )
}

// Generators for property-based testing
const engineProcessArb = fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    status: fc.constantFrom('running', 'stopped', 'error'),
    lastHeartbeat: fc.string(),
    pid: fc.integer({ min: 1000, max: 99999 })
})

const systemHealthMetricsArb = fc.record({
    engineStatus: fc.record({
        status: fc.constantFrom('running', 'stopped', 'error'),
        processes: fc.array(engineProcessArb, { minLength: 1, maxLength: 10 })
    }),
    serverLoad: fc.record({
        cpuUsage: fc.float({ min: 0, max: 100 }),
        memoryUsage: fc.float({ min: 0, max: 32 }),
        memoryTotal: fc.float({ min: 1, max: 32 })
    })
})

describe('SystemHealthPanel Property Tests', () => {
    /**
     * Feature: trading-dashboard-ui-enhancement, Property 1: System Health Panel Resource Display
     * For any system resource data (CPU usage, memory usage), the SystemHealthPanel should render 
     * progress bars with appropriate visual indicators and color coding based on usage thresholds
     * Validates: Requirements 1.2
     */
    it('should render resource displays with appropriate color coding for any system resource data', () => {
        fc.assert(
            fc.property(systemHealthMetricsArb, (healthData: SystemHealthMetrics) => {
                // Ensure memory usage doesn't exceed total
                if (healthData.serverLoad.memoryUsage > healthData.serverLoad.memoryTotal) {
                    healthData.serverLoad.memoryUsage = healthData.serverLoad.memoryTotal * 0.8
                }

                const { container } = renderWithTooltip(<SystemHealthPanel healthData={healthData} />)

                // Check that CPU and memory usage are displayed (use getAllByText to handle duplicates)
                const cpuTexts = screen.getAllByText(new RegExp(`${healthData.serverLoad.cpuUsage.toFixed(1)}%`))
                expect(cpuTexts.length).toBeGreaterThan(0)

                const memoryTexts = screen.getAllByText(new RegExp(`${healthData.serverLoad.memoryUsage.toFixed(1)}G`))
                expect(memoryTexts.length).toBeGreaterThan(0)

                // Check color coding based on thresholds (check the first visible element)
                const cpuPercent = healthData.serverLoad.cpuUsage
                const cpuText = cpuTexts[0]
                if (cpuPercent > 80) {
                    expect(cpuText).toHaveClass('text-destructive')
                } else if (cpuPercent > 60) {
                    expect(cpuText).toHaveClass('text-yellow-500')
                } else {
                    expect(cpuText).toHaveClass('text-foreground')
                }

                const memoryPercent = (healthData.serverLoad.memoryUsage / healthData.serverLoad.memoryTotal) * 100
                const memoryText = memoryTexts[0]
                if (memoryPercent > 80) {
                    expect(memoryText).toHaveClass('text-destructive')
                } else if (memoryPercent > 60) {
                    expect(memoryText).toHaveClass('text-yellow-500')
                } else {
                    expect(memoryText).toHaveClass('text-foreground')
                }

                // Check that engine status section is present (use getAllByText)
                const engineTexts = screen.getAllByText('엔진')
                expect(engineTexts.length).toBeGreaterThan(0)

                // Check that the correct number of LED indicators are rendered
                const runningCount = healthData.engineStatus.processes.filter(p => p.status === 'running').length
                const totalCount = healthData.engineStatus.processes.length
                const countTexts = screen.getAllByText(`${runningCount}/${totalCount}`)
                expect(countTexts.length).toBeGreaterThan(0)

                // Clean up after each test
                container.remove()
            }),
            { numRuns: 100 }
        )
    })

    /**
     * Feature: trading-dashboard-ui-enhancement, Property 2: Engine Status LED Indicator Mapping
     * For any engine status value (running, stopped, error), the LED indicator should display 
     * the corresponding color (green for running, gray for stopped, red for error)
     * Validates: Requirements 1.5
     */
    it('should map engine status to correct LED indicator colors for any engine status', () => {
        fc.assert(
            fc.property(systemHealthMetricsArb, (healthData: SystemHealthMetrics) => {
                // Ensure memory usage doesn't exceed total
                if (healthData.serverLoad.memoryUsage > healthData.serverLoad.memoryTotal) {
                    healthData.serverLoad.memoryUsage = healthData.serverLoad.memoryTotal * 0.8
                }

                const { container } = renderWithTooltip(<SystemHealthPanel healthData={healthData} />)

                // Check that each status maps to correct color class
                const hasRunning = healthData.engineStatus.processes.some(p => p.status === 'running')
                const hasError = healthData.engineStatus.processes.some(p => p.status === 'error')
                const hasStopped = healthData.engineStatus.processes.some(p => p.status === 'stopped')

                if (hasRunning) {
                    // Should have green LED indicators for running processes
                    const runningLEDs = container.querySelectorAll('.bg-green-500')
                    expect(runningLEDs.length).toBeGreaterThan(0)
                }

                if (hasError) {
                    // Should have red LED indicators for error processes
                    const errorLEDs = container.querySelectorAll('.bg-destructive')
                    expect(errorLEDs.length).toBeGreaterThan(0)
                }

                if (hasStopped) {
                    // Should have gray LED indicators for stopped processes
                    const stoppedLEDs = container.querySelectorAll('.bg-muted-foreground')
                    expect(stoppedLEDs.length).toBeGreaterThan(0)
                }

                // Verify overall engine status color - fixed logic
                const serverIcon = container.querySelector('.lucide-server')
                expect(serverIcon).toBeInTheDocument()

                const runningCount = healthData.engineStatus.processes.filter(p => p.status === 'running').length
                if (hasError) {
                    expect(serverIcon).toHaveClass('text-destructive')
                } else if (runningCount > 0) {
                    expect(serverIcon).toHaveClass('text-green-500')
                } else {
                    expect(serverIcon).toHaveClass('text-muted-foreground')
                }

                // Clean up after each test
                container.remove()
            }),
            { numRuns: 100 }
        )
    })
})