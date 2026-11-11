<?php

namespace App\Services;

use App\Models\CheckIn;
use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CheckInService
{
    /**
     * Check a child into a room.
     */
    public function checkIn(
        Tenant $tenant,
        int $roomId,
        int $childId
    ): CheckIn {
        try {
            return DB::transaction(function () use (
                $tenant,
                $roomId,
                $childId
            ) {
                // Ensure the room belongs to this tenant.
                $room = $tenant->rooms()->findOrFail($roomId);

                // Ensure the child belongs to this tenant.
                $tenant->children()->findOrFail($childId);

                // Prevent duplicate active check-ins.
                $alreadyCheckedIn = $tenant->checkIns()
                    ->where('child_id', $childId)
                    ->whereNull('checked_out_at')
                    ->exists();

                if ($alreadyCheckedIn) {
                    throw new ConflictHttpException(
                        'Child is already checked into a room.'
                    );
                }

                return $tenant->checkIns()->create([
                    'room_id' => $room->id,
                    'child_id' => $childId,
                    'checked_in_at' => now(),
                ]);
            });
        } catch (QueryException $exception) {
            // The database unique constraint protects against
            // simultaneous check-in requests.
            if ($this->isUniqueViolation($exception)) {
                throw new ConflictHttpException(
                    'Child is already checked into a room.'
                );
            }

            throw $exception;
        }
    }

    /**
     * Check a child out of their room.
     */
    public function checkOut(
        Tenant $tenant,
        int $checkInId
    ): CheckIn {
        return DB::transaction(function () use (
            $tenant,
            $checkInId
        ) {
            // Only find check-ins belonging to this tenant.
            $checkIn = $tenant->checkIns()
                ->lockForUpdate()
                ->findOrFail($checkInId);

            if ($checkIn->checked_out_at !== null) {
                throw new ConflictHttpException(
                    'Child has already been checked out.'
                );
            }

            $checkIn->update([
                'checked_out_at' => now(),
            ]);

            return $checkIn->fresh();
        });
    }

    /**
     * List current occupants of a room.
     */
    public function getOccupants(
        Tenant $tenant,
        int $roomId
    ) {
        // Verify room ownership before retrieving occupants.
        $room = $tenant->rooms()->findOrFail($roomId);

        return $room->checkIns()
            ->whereNull('checked_out_at')
            ->with('child')
            ->orderBy('checked_in_at')
            ->get();
    }

    /**
     * Identify database unique constraint violations.
     */
    private function isUniqueViolation(
        QueryException $exception
    ): bool {
        $sqlState = $exception->errorInfo[0] ?? null;
        $driverCode = $exception->errorInfo[1] ?? null;

        return in_array($sqlState, ['23000', '23505'], true)
            && (
                (int) $driverCode === 1062
                || str_contains(
                    strtolower($exception->getMessage()),
                    'unique constraint'
                )
                || str_contains(
                    strtolower($exception->getMessage()),
                    'duplicate entry'
                )
            );
    }
}
