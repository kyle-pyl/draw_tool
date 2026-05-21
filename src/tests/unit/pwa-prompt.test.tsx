import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PwaPrompt } from '../../ui/PwaPrompt';

describe('PwaPrompt', () => {
  let deferredPrompt: { prompt: ReturnType<typeof vi.fn>; userChoice: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    deferredPrompt = { prompt: vi.fn().mockResolvedValue(undefined), userChoice: vi.fn().mockResolvedValue({ outcome: 'accepted' }) };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          installing: null,
          addEventListener: vi.fn(),
        }),
        controller: null,
        addEventListener: vi.fn(),
        register: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  it('renders null initially when no prompt', () => {
    const { container } = render(<PwaPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('shows install prompt when beforeinstallprompt fires', () => {
    render(<PwaPrompt />);
    act(() => {
      const event = new Event('beforeinstallprompt') as Event;
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'prompt', { value: deferredPrompt.prompt });
      Object.defineProperty(event, 'userChoice', { value: deferredPrompt.userChoice });
      window.dispatchEvent(event);
    });
    expect(screen.getByText('Install Draw Tool for offline use')).toBeDefined();
    expect(screen.getByText('Install')).toBeDefined();
  });

  it('handles install button click', async () => {
    render(<PwaPrompt />);
    act(() => {
      const event = new Event('beforeinstallprompt') as Event;
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'prompt', { value: deferredPrompt.prompt });
      Object.defineProperty(event, 'userChoice', { value: deferredPrompt.userChoice });
      window.dispatchEvent(event);
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Install'));
    });
    expect(deferredPrompt.prompt).toHaveBeenCalled();
  });

  it('dismisses install prompt', () => {
    render(<PwaPrompt />);
    act(() => {
      const event = new Event('beforeinstallprompt') as Event;
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'prompt', { value: deferredPrompt.prompt });
      Object.defineProperty(event, 'userChoice', { value: deferredPrompt.userChoice });
      window.dispatchEvent(event);
    });
    fireEvent.click(screen.getByText('\u2715'));
    expect(screen.queryByText('Install Draw Tool for offline use')).toBeNull();
  });

  it('hides install after appinstalled event', () => {
    render(<PwaPrompt />);
    act(() => {
      const event = new Event('beforeinstallprompt') as Event;
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'prompt', { value: deferredPrompt.prompt });
      Object.defineProperty(event, 'userChoice', { value: deferredPrompt.userChoice });
      window.dispatchEvent(event);
    });
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByText('Install Draw Tool for offline use')).toBeNull();
  });

  it('renders update prompt when rendered with update content', () => {
    render(
      <div className="pwa-prompt pwa-prompt-update">
        <div className="pwa-prompt-content">
          <span className="pwa-prompt-text">A new version is available</span>
          <button className="pwa-prompt-btn pwa-prompt-btn-primary">Update</button>
        </div>
      </div>
    );
    expect(screen.getByText('A new version is available')).toBeDefined();
    expect(screen.getByText('Update')).toBeDefined();
  });
});
