<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Resources\CheckInResource;
use App\Models\Tenant;
use App\Services\CheckInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CheckInController extends Controller
{
    public function __construct(
        private readonly CheckInService $checkInService
    ) {
    }

    /**
     * Check a child into a room.
     */
    public function checkIn(
        CheckInRequest $request,
        int $room
    ): JsonResponse {
        $tenant = $request->attributes->get('tenant');

        $checkIn = $this->checkInService->checkIn(
            $tenant,
            $room,
            $request->validated('child_id')
        );

        return (new CheckInResource($checkIn->load('child')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Check a child out of a room.
     */
    public function checkOut(
        Request $request,
        int $id
    ): JsonResponse {
        $tenant = $request->attributes->get('tenant');

        $checkIn = $this->checkInService->checkOut(
            $tenant,
            $id
        );

        return (new CheckInResource($checkIn->load('child')))
            ->response();
    }

    /**
     * List current occupants of a room.
     */
    public function occupants(
        Request $request,
        int $room
    ): AnonymousResourceCollection {
        $tenant = $request->attributes->get('tenant');

        $occupants = $this->checkInService->getOccupants(
            $tenant,
            $room
        );

        return CheckInResource::collection($occupants);
    }
}