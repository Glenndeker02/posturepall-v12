'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodePairing } from './qr-code-pairing';
import { PairedDevicesList } from './paired-devices-list';
import { Smartphone, QrCode, List } from 'lucide-react';

interface MobilePairingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function MobilePairingDialog({ open, onOpenChange, userId }: MobilePairingDialogProps) {
  const [activeTab, setActiveTab] = useState('pair');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Smartphone className="w-6 h-6 text-indigo-600" />
            Mobile App Connection
          </DialogTitle>
          <DialogDescription>
            Connect your PosturePal mobile app to sync your data and get personalized exercise recommendations
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pair" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Pair New Device
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              My Devices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pair" className="mt-6">
            <QRCodePairing
              userId={userId}
              onPaired={(deviceInfo) => {
                console.log('Device paired:', deviceInfo);
                // Switch to devices tab to show the newly paired device
                setTimeout(() => setActiveTab('devices'), 2000);
              }}
              showInstructions={true}
              compact={false}
            />
          </TabsContent>

          <TabsContent value="devices" className="mt-6">
            <PairedDevicesList
              userId={userId}
              onAddDevice={() => setActiveTab('pair')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
