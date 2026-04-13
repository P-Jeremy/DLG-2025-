import { renderHook, waitFor } from '@testing-library/react';
import { useMetaSync, confirmPendingSync } from './useMetaSync';
import * as metaApi from '../api/meta';

jest.mock('../api/meta');

const mockFetchMeta = metaApi.fetchMeta as jest.MockedFunction<typeof metaApi.fetchMeta>;

describe('useMetaSync', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('calls onRefresh when meta.updatedAt is more recent than lastSync', async () => {
    localStorage.setItem('lastSync', '2024-01-01T00:00:00.000Z');
    mockFetchMeta.mockResolvedValue({ updatedAt: '2024-06-01T00:00:00.000Z' });
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  });

  it('stores pendingSync with meta.updatedAt when stale', async () => {
    localStorage.setItem('lastSync', '2024-01-01T00:00:00.000Z');
    const updatedAt = '2024-06-01T00:00:00.000Z';
    mockFetchMeta.mockResolvedValue({ updatedAt });
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('pendingSync')).toBe(updatedAt);
  });

  it('does NOT update lastSync after refresh', async () => {
    localStorage.setItem('lastSync', '2024-01-01T00:00:00.000Z');
    const updatedAt = '2024-06-01T00:00:00.000Z';
    mockFetchMeta.mockResolvedValue({ updatedAt });
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('lastSync')).toBe('2024-01-01T00:00:00.000Z');
  });

  it('does not call onRefresh when meta.updatedAt equals lastSync', async () => {
    const updatedAt = '2024-06-01T00:00:00.000Z';
    localStorage.setItem('lastSync', updatedAt);
    mockFetchMeta.mockResolvedValue({ updatedAt });
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(mockFetchMeta).toHaveBeenCalledTimes(1));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('calls onRefresh when localStorage has no lastSync', async () => {
    mockFetchMeta.mockResolvedValue({ updatedAt: '2024-06-01T00:00:00.000Z' });
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  });

  it('does not throw when fetchMeta fails (network error)', async () => {
    mockFetchMeta.mockRejectedValue(new Error('Network error'));
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    const { unmount } = renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(mockFetchMeta).toHaveBeenCalledTimes(1));
    expect(onRefresh).not.toHaveBeenCalled();
    expect(() => unmount()).not.toThrow();
  });

  it('still sets pendingSync even if onRefresh throws', async () => {
    localStorage.setItem('lastSync', '2024-01-01T00:00:00.000Z');
    const updatedAt = '2024-06-01T00:00:00.000Z';
    mockFetchMeta.mockResolvedValue({ updatedAt });
    const onRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));

    renderHook(() => useMetaSync(onRefresh));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('pendingSync')).toBe(updatedAt);
    expect(localStorage.getItem('lastSync')).toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('confirmPendingSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('promotes pendingSync to lastSync and removes pendingSync', () => {
    localStorage.setItem('pendingSync', '2024-06-01T00:00:00.000Z');

    confirmPendingSync();

    expect(localStorage.getItem('lastSync')).toBe('2024-06-01T00:00:00.000Z');
    expect(localStorage.getItem('pendingSync')).toBeNull();
  });

  it('does nothing when no pendingSync exists', () => {
    localStorage.setItem('lastSync', '2024-01-01T00:00:00.000Z');

    confirmPendingSync();

    expect(localStorage.getItem('lastSync')).toBe('2024-01-01T00:00:00.000Z');
  });
});
