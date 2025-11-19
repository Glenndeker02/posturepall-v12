/**
 * Add Workstation Dialog
 * Multi-step dialog for adding a new workstation with calibration
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialogue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PostureCalibration } from './posture-calibration';
import { MapPin, ArrowLeft, Check } from 'lucide-react';
import type { CalibrationData } from '@/lib/ai/types';

type Step = 'details' | 'calibration' | 'success';

interface AddWorkstationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onWorkstationCreated: (workstation: {
    id: string;
    name: string;
    location: string | null;
    calibrationData: CalibrationData | null;
  }) => void;
}

export function AddWorkstationDialog({
  open,
  onOpenChange,
  userId,
  onWorkstationCreated,
}: AddWorkstationDialogProps) {
  const [step, setStep] = useState<Step>('details');
  const [workstationName, setWorkstationName] = useState('');
  const [workstationLocation, setWorkstationLocation] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [skipCalibration, setSkipCalibration] = useState(false);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // Reset state
    setStep('details');
    setWorkstationName('');
    setWorkstationLocation('');
    setIsDefault(false);
    setSkipCalibration(false);
    setCalibrationData(null);
    setError(null);
    onOpenChange(false);
  };

  const handleDetailsNext = () => {
    if (!workstationName.trim()) {
      setError('Please enter a workstation name');
      return;
    }

    setError(null);

    if (skipCalibration) {
      // Create workstation without calibration
      createWorkstation(null);
    } else {
      // Proceed to calibration
      setStep('calibration');
    }
  };

  const handleCalibrationComplete = (data: CalibrationData) => {
    setCalibrationData(data);
    createWorkstation(data);
  };

  const handleCalibrationCancel = () => {
    setStep('details');
  };

  const createWorkstation = async (calibration: CalibrationData | null) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch('/api/workstations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: workstationName.trim(),
          location: workstationLocation.trim() || null,
          calibrationData: calibration,
          isDefault,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        onWorkstationCreated(data.workstation);

        // Auto-close after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to create workstation');
        setStep('details');
      }
    } catch (error) {
      console.error('Error creating workstation:', error);
      setError('Failed to create workstation');
      setStep('details');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        showCloseButton={step !== 'calibration'}
      >
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Add New Workstation
              </DialogTitle>
              <DialogDescription>
                Set up a new workstation and calibrate your posture baseline
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Workstation Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Home Office, Work Desk, Study Room"
                  value={workstationName}
                  onChange={(e) => setWorkstationName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main bedroom, Corner office, Library"
                  value={workstationLocation}
                  onChange={(e) => setWorkstationLocation(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked === true)}
                />
                <Label
                  htmlFor="default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as default workstation
                </Label>
              </div>

              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="skip-calibration"
                    checked={skipCalibration}
                    onCheckedChange={(checked) => setSkipCalibration(checked === true)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="skip-calibration"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Skip calibration for now
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Not recommended. You can calibrate later, but posture tracking won't
                      be personalized until you do.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleDetailsNext} disabled={isCreating}>
                {skipCalibration ? 'Create Workstation' : 'Next: Calibration'}
              </Button>
            </div>
          </>
        )}

        {step === 'calibration' && (
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCalibrationCancel}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Details
              </Button>
            </div>

            <PostureCalibration
              workstationName={workstationName}
              onComplete={handleCalibrationComplete}
              onCancel={handleCalibrationCancel}
            />
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-green-600">
                <div className="rounded-full bg-green-100 p-2">
                  <Check className="h-6 w-6" />
                </div>
                Workstation Created!
              </DialogTitle>
            </DialogHeader>

            <div className="py-8 text-center">
              <p className="text-lg font-medium mb-2">{workstationName}</p>
              {workstationLocation && (
                <p className="text-sm text-muted-foreground mb-4">{workstationLocation}</p>
              )}

              {calibrationData ? (
                <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Calibrated and ready to use
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠ Remember to calibrate this workstation later
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-4">Closing...</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
