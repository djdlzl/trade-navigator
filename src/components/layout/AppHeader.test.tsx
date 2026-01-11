import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppHeader } from './AppHeader';

// Mock the SystemHealthPanel component
vi.mock('./SystemHealthPanel', () => ({
    SystemHealthPanel: ({ healthData }: { healthData: { engineStatus: { status: string } } }) => (
        <div data-testid="system-health-panel">
            System Health Panel - Status: {healthData.engineStatus.status}
        </div>
    ),
}));

describe('AppHeader', () => {
    it('should render SystemHealthPanel and not render API status section', () => {
        render(<AppHeader />);

        // Verify SystemHealthPanel is present
        expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();

        // Verify portfolio summary is still present (left side)
        expect(screen.getByText('총 자산')).toBeInTheDocument();
        expect(screen.getByText('당일 수익')).toBeInTheDocument();

        // Verify no API status section exists
        expect(screen.queryByText('API 상태')).not.toBeInTheDocument();
        expect(screen.queryByText('API Status')).not.toBeInTheDocument();
        expect(screen.queryByText('연결 상태')).not.toBeInTheDocument();
    });

    it('should maintain responsive layout structure', () => {
        render(<AppHeader />);

        // Check that header has proper structure
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('h-16', 'bg-card', 'border-b', 'border-border', 'px-6', 'flex', 'items-center', 'justify-between');

        // Verify portfolio summary section exists
        expect(screen.getByText('총 자산')).toBeInTheDocument();

        // Verify SystemHealthPanel is rendered
        expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();
    });

    it('should display portfolio summary with proper formatting', () => {
        render(<AppHeader />);

        // Check that portfolio values are displayed
        expect(screen.getByText('총 자산')).toBeInTheDocument();
        expect(screen.getByText('당일 수익')).toBeInTheDocument();

        // Check that values are formatted (should contain Korean won symbol)
        const wonValues = screen.getAllByText(/억원|만원|원/);
        expect(wonValues.length).toBeGreaterThan(0);

        // Check specific formatted values
        expect(screen.getByText(/15\.2억원/)).toBeInTheDocument();
        expect(screen.getByText(/1524만원/)).toBeInTheDocument();
    });
});