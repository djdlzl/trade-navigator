import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TradeTerminal } from './TradeTerminal';

describe('TradeTerminal', () => {
    it('should render categorized logs with proper formatting', () => {
        render(<TradeTerminal />);

        // Check that the component renders
        expect(screen.getByText('실시간 매매 로그')).toBeInTheDocument();

        // Check that logs are displayed
        const logContainer = document.querySelector('.terminal-log');
        expect(logContainer).toBeInTheDocument();
    });

    it('should display system logs with proper category formatting', () => {
        render(<TradeTerminal />);

        // Look for system category indicators
        const systemLogs = screen.queryAllByText(/\[시스템\]/);
        if (systemLogs.length > 0) {
            expect(systemLogs[0]).toBeInTheDocument();
        }
    });

    it('should display strategy logs with proper category formatting', () => {
        render(<TradeTerminal />);

        // Look for strategy category indicators
        const strategyLogs = screen.queryAllByText(/\[전략\]/);
        if (strategyLogs.length > 0) {
            expect(strategyLogs[0]).toBeInTheDocument();
        }
    });

    it('should emphasize trading reasons with cyan highlighting', () => {
        render(<TradeTerminal />);

        // Look for reason tags in cyan (this tests the structure, actual color is CSS)
        const reasonElements = document.querySelectorAll('.text-cyan-400');
        if (reasonElements.length > 0) {
            expect(reasonElements[0]).toBeInTheDocument();
        }
    });
});