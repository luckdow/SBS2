// Simple test to verify error boundary functionality
// This can be run in browser console or as a React component test

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ErrorBoundary, { StepErrorBoundary } from '../components/ui/ErrorBoundary';

// Test component that throws a DOM error
function TestComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    // Simulate a DOM manipulation error
    throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
  }
  return <div>Component rendered successfully</div>;
}

// Test suite
describe('ErrorBoundary', () => {
  test('should catch DOM manipulation errors', async () => {
    const onError = jest.fn();
    
    const { getByText, queryByText } = render(
      <ErrorBoundary onError={onError}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should display error UI
    expect(getByText('Geçici Hata')).toBeInTheDocument();
    expect(getByText('Sayfa geçişi sırasında hata oluştu')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  test('should allow manual recovery', async () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error state
    expect(getByText('Tekrar Dene')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(getByText('Tekrar Dene'));

    // Re-render with working component
    rerender(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show working component
    await waitFor(() => {
      expect(getByText('Component rendered successfully')).toBeInTheDocument();
    });
  });

  test('StepErrorBoundary should reset on step change', () => {
    const { rerender, getByText } = render(
      <StepErrorBoundary stepName="step-1">
        <TestComponent shouldThrow={true} />
      </StepErrorBoundary>
    );

    // Should show error
    expect(getByText('Geçici Hata')).toBeInTheDocument();

    // Change step (different resetKey)
    rerender(
      <StepErrorBoundary stepName="step-2">
        <TestComponent shouldThrow={false} />
      </StepErrorBoundary>
    );

    // Should auto-reset and show working component
    expect(getByText('Component rendered successfully')).toBeInTheDocument();
  });
});

export { TestComponent };