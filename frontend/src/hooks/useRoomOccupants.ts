import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";

import { checkInApi } from "../api/checkInApi";
import type { CheckIn } from "../types";

export function useRoomOccupants(roomId: number) {
  const [occupants, setOccupants] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOccupants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await checkInApi.getOccupants(roomId);
      setOccupants(data);
    } catch {
      setError("Unable to load room occupants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void loadOccupants();
  }, [loadOccupants]);

  const checkIn = async (childId: number): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      await checkInApi.checkIn(roomId, {
        child_id: childId,
      });

      await loadOccupants();
      return true;
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(message || "Unable to check in child. Please try again.");

      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const checkOut = async (checkInId: number): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      await checkInApi.checkOut(checkInId);

      await loadOccupants();
      return true;
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(message || "Unable to check out child. Please try again.");

      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    occupants,
    loading,
    submitting,
    error,
    checkIn,
    checkOut,
    refresh: loadOccupants,
  };
}
