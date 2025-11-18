/**
 * Workstation Selector Component
 * Allows users to select their current workstation and add new ones
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Settings, MapPin } from 'lucide-react';
import type { CalibrationData } from '@/lib/ai/types';

export interface Workstation {
  id: string;
  userId: string;
  name: string;
  location: string | null;
  calibrationData: CalibrationData | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkstationSelectorProps {
  userId: string;
  selectedWorkstationId: string | null;
  onWorkstationChange: (workstation: Workstation | null) => void;
  onAddWorkstation: () => void;
  onManageWorkstations?: () => void;
  className?: string;
}

export function WorkstationSelector({
  userId,
  selectedWorkstationId,
  onWorkstationChange,
  onAddWorkstation,
  onManageWorkstations,
  className = '',
}: WorkstationSelectorProps) {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workstations on mount
  useEffect(() => {
    fetchWorkstations();
  }, [userId]);

  // Auto-select default workstation if none selected
  useEffect(() => {
    if (workstations.length > 0 && !selectedWorkstationId) {
      const defaultWorkstation = workstations.find((ws) => ws.isDefault);
      if (defaultWorkstation) {
        onWorkstationChange(defaultWorkstation);
      }
    }
  }, [workstations, selectedWorkstationId]);

  const fetchWorkstations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workstations?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setWorkstations(data.workstations);
      } else {
        setError(data.error || 'Failed to load workstations');
      }
    } catch (error) {
      console.error('Error fetching workstations:', error);
      setError('Failed to load workstations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkstationChange = (workstationId: string) => {
    const workstation = workstations.find((ws) => ws.id === workstationId);
    onWorkstationChange(workstation || null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-md border border-destructive bg-destructive/10 p-3 ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWorkstations}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            value={selectedWorkstationId || undefined}
            onValueChange={handleWorkstationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a workstation" />
            </SelectTrigger>
            <SelectContent>
              {workstations.map((workstation) => (
                <SelectItem key={workstation.id} value={workstation.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{workstation.name}</span>
                      {workstation.location && (
                        <span className="text-xs text-muted-foreground">
                          {workstation.location}
                        </span>
                      )}
                    </div>
                    {workstation.isDefault && (
                      <span className="ml-2 text-xs text-primary">(Default)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onAddWorkstation}
          title="Add new workstation"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {onManageWorkstations && (
          <Button
            variant="outline"
            size="icon"
            onClick={onManageWorkstations}
            title="Manage workstations"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Calibration status indicator */}
      {selectedWorkstationId && (
        <WorkstationCalibrationStatus
          workstation={workstations.find((ws) => ws.id === selectedWorkstationId)}
        />
      )}
    </div>
  );
}

/**
 * Shows calibration status for selected workstation
 */
function WorkstationCalibrationStatus({
  workstation,
}: {
  workstation: Workstation | undefined;
}) {
  if (!workstation) return null;

  const hasCalibration = workstation.calibrationData !== null;

  return (
    <div
      className={`rounded-md border p-3 ${
        hasCalibration
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 h-2 w-2 rounded-full ${
            hasCalibration ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {hasCalibration ? 'Calibrated' : 'Not Calibrated'}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasCalibration
              ? `Last calibrated: ${new Date(
                  workstation.calibrationData!.timestamp
                ).toLocaleDateString()}`
              : 'Calibration required for accurate posture tracking'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for workstation management
 */
export function useWorkstations(userId: string) {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkstations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workstations?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setWorkstations(data.workstations);
      } else {
        setError(data.error || 'Failed to load workstations');
      }
    } catch (error) {
      console.error('Error fetching workstations:', error);
      setError('Failed to load workstations');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkstation = async (
    name: string,
    location: string | null,
    calibrationData: CalibrationData | null,
    isDefault: boolean = false
  ): Promise<Workstation | null> => {
    try {
      const response = await fetch('/api/workstations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          location,
          calibrationData,
          isDefault,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkstations(); // Refresh list
        return data.workstation;
      } else {
        setError(data.error || 'Failed to create workstation');
        return null;
      }
    } catch (error) {
      console.error('Error creating workstation:', error);
      setError('Failed to create workstation');
      return null;
    }
  };

  const updateWorkstation = async (
    id: string,
    updates: Partial<Omit<Workstation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Workstation | null> => {
    try {
      const response = await fetch(`/api/workstations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkstations(); // Refresh list
        return data.workstation;
      } else {
        setError(data.error || 'Failed to update workstation');
        return null;
      }
    } catch (error) {
      console.error('Error updating workstation:', error);
      setError('Failed to update workstation');
      return null;
    }
  };

  const deleteWorkstation = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/workstations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkstations(); // Refresh list
        return true;
      } else {
        setError(data.error || 'Failed to delete workstation');
        return false;
      }
    } catch (error) {
      console.error('Error deleting workstation:', error);
      setError('Failed to delete workstation');
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWorkstations();
    }
  }, [userId]);

  return {
    workstations,
    isLoading,
    error,
    fetchWorkstations,
    createWorkstation,
    updateWorkstation,
    deleteWorkstation,
  };
}
