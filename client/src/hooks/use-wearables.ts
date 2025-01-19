import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WearableDevice, WearableActivity } from '@db/schema';

export function useWearables() {
  const queryClient = useQueryClient();

  const { data: devices } = useQuery<WearableDevice[]>({
    queryKey: ['/api/wearables'],
  });

  const connectDevice = useMutation({
    mutationFn: async (deviceData: Partial<WearableDevice>) => {
      const response = await fetch('/api/wearables/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wearables'] });
    },
  });

  const syncDevice = useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await fetch(`/api/wearables/${deviceId}/sync`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wearables'] });
    },
  });

  const getDeviceActivities = async (deviceId: number) => {
    const response = await fetch(`/api/wearables/${deviceId}/activities`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json() as Promise<WearableActivity[]>;
  };

  return {
    devices,
    connectDevice: connectDevice.mutateAsync,
    syncDevice: syncDevice.mutateAsync,
    getDeviceActivities,
  };
}
