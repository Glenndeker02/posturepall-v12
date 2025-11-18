'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode as QrCodeIcon,
} from 'lucide-react';

interface QRCodePairingProps {
  userId: string;
  onPaired?: (deviceInfo: any) => void;
  showInstructions?: boolean;
  compact?: boolean;
}

export function QRCodePairing({
  userId,
  onPaired,
  showInstructions = true,
  compact = false,
}: QRCodePairingProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'expired' | 'connected'>('idle');
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const generateQRCode = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);

      const response = await fetch('/api/pair/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(data.qrData, {
        width: compact ? 200 : 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setQrDataUrl(qrUrl);
      setPairingCode(data.pairingCode);
      setExpiresAt(data.expiresAt);
      setCountdown(data.expiresIn);
      setStatus('active');

      // Start polling for connection
      startPolling(data.pairingCode);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err.message || 'Failed to generate QR code');
      setStatus('idle');
    }
  }, [userId, compact]);

  const startPolling = (code: string) => {
    // Clear any existing interval
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    // Poll every 2 seconds to check if device connected
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pair/devices?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.devices.length > 0) {
          // Check if there's a device with our pairing code (recently connected)
          const recentDevice = data.devices.find((d: any) => {
            const timeSinceCreation = Date.now() - new Date(d.createdAt).getTime();
            return timeSinceCreation < 10000; // Connected in last 10 seconds
          });

          if (recentDevice) {
            setStatus('connected');
            clearInterval(interval);
            if (onPaired) {
              onPaired(recentDevice);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    setCheckInterval(interval);
  };

  // Countdown timer
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          if (checkInterval) clearInterval(checkInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, checkInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [checkInterval]);

  // Auto-generate on mount
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    if (checkInterval) clearInterval(checkInterval);
    generateQRCode();
  };

  if (compact) {
    return (
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {status === 'active' && qrDataUrl && (
          <div className="space-y-3">
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="mx-auto rounded-lg border-4 border-white shadow-lg"
            />
            <div className="text-sm text-gray-600">
              Expires in: <span className="font-mono font-semibold">{formatCountdown(countdown)}</span>
            </div>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex flex-col items-center space-y-2 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-green-700">Connected!</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 mx-auto text-red-500" />
            <p className="text-red-600">QR code expired</p>
            <Button onClick={handleRefresh} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Code
            </Button>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Connect Mobile App
        </CardTitle>
        <CardDescription>
          Scan this QR code with the PosturePal mobile app
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="relative">
          {status === 'loading' && (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
          )}

          {status === 'active' && qrDataUrl && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrDataUrl}
                  alt="Pairing QR Code"
                  className="rounded-lg border-4 border-white shadow-xl"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Code Active</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {formatCountdown(countdown)}
                </Badge>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-700">Successfully Connected!</h3>
                <p className="text-gray-600 mt-2">
                  Your mobile app is now syncing with your web dashboard
                </p>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-red-700">QR Code Expired</h3>
                <p className="text-gray-600">The pairing code has expired. Generate a new one.</p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New QR Code
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
              <Button onClick={handleRefresh} variant="outline" className="mt-3 w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {showInstructions && status !== 'connected' && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">How to connect:</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">1.</span>
                <span>Open the PosturePal app on your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">2.</span>
                <span>Tap the "Connect to Web" or QR code icon</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>Scan this QR code with your phone camera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Confirm the connection in the app</span>
              </li>
            </ol>
          </div>
        )}

        {/* Refresh Button */}
        {status === 'active' && (
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
