import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Strategies from './Strategies';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Get the mocked toast functions
import { toast } from 'sonner';
const mockToast = toast as unknown as {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
};

describe('Strategies - Emergency Stop Dialog Flow', () => {
    beforeEach(() => {
        mockToast.success.mockClear();
        mockToast.error.mockClear();
    });

    it('should display emergency stop button', () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        expect(emergencyStopButton).toBeInTheDocument();
    });

    it('should open confirmation dialog when emergency stop button is clicked', async () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByText('긴급 정지 확인')).toBeInTheDocument();
        });
    });

    it('should display correct Korean confirmation text in dialog', async () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByText('전체 포지션을 청산하고 엔진을 정지하시겠습니까?')).toBeInTheDocument();
        });
    });

    it('should close dialog when cancel button is clicked', async () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByText('긴급 정지 확인')).toBeInTheDocument();
        });

        const cancelButton = screen.getByRole('button', { name: /취소/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('긴급 정지 확인')).not.toBeInTheDocument();
        });
    });

    it('should execute emergency stop and show toast when confirmed', async () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByText('긴급 정지 확인')).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /긴급 정지 실행/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith("긴급 정지 실행", {
                description: "모든 포지션이 청산되고 주문이 중단되었습니다.",
            });
        });
    });

    it('should pause all strategies when emergency stop is confirmed', async () => {
        render(<Strategies />);

        // Check that at least one strategy is initially active
        const activeStrategies = screen.getAllByText('활성');
        expect(activeStrategies.length).toBeGreaterThan(0);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByText('긴급 정지 확인')).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /긴급 정지 실행/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            // After emergency stop, no strategies should be active
            expect(screen.queryByText('활성')).not.toBeInTheDocument();
        });
    });

    it('should display dialog with proper action buttons', async () => {
        render(<Strategies />);

        const emergencyStopButton = screen.getByRole('button', { name: /긴급 정지/i });
        fireEvent.click(emergencyStopButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /긴급 정지 실행/i })).toBeInTheDocument();
        });
    });
});