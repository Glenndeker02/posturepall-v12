'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PairedDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  lastSyncedAt: string;
  lastActiveAt: string;
  createdAt: string;
}

interface PairedDevicesListProps {
  userId: string;
  onAddDevice?: () => void;
}

export function PairedDevicesList({ userId, onAddDevice }: PairedDevicesListProps) {
  const [devices, setDevices] = useState<PairedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pair/devices?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setDevices(data.devices);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [userId]);

  const handleUnpair = async (deviceId: string) => {
    if (!confirm('Are you sure you want to unpair this device?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pair/devices/${deviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error unpairing device:', err);
      alert('Failed to unpair device: ' + err.message);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    return <Smartphone className="w-5 h-5" />;
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    return deviceType === 'ios' ? 'iOS' : 'Android';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Paired Devices
            </CardTitle>
            <CardDescription>
              Devices connected to your PosturePal account
            </CardDescription>
          </div>
          {onAddDevice && (
            <Button onClick={onAddDevice} size="sm" variant="outline">
              + Add Device
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
            <Button onClick={fetchDevices} variant="outline" size="sm" className="mt-2 w-full">
              Retry
            </Button>
          </div>
        )}

        {!error && devices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No devices paired yet</p>
            {onAddDevice && (
              <Button onClick={onAddDevice} className="mt-4" size="sm">
                Connect Your First Device
              </Button>
            )}
          </div>
        )}

        {!error && devices.length > 0 && (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{device.deviceName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getDeviceTypeLabel(device.deviceType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Paired {formatDistanceToNow(new Date(device.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Active {formatDistanceToNow(new Date(device.lastActiveAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleUnpair(device.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
