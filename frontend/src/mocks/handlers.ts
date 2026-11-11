import { http, HttpResponse } from "msw";
import { initialCheckIns, mockChildren } from "./data";
import type { CheckIn } from "../types";

// Mutable in-memory database.
let checkIns: CheckIn[] = structuredClone(initialCheckIns);
let nextCheckInId = 6;

export const resetMockData = () => {
  checkIns = structuredClone(initialCheckIns);
  nextCheckInId = 6;
};

const getTenantId = (request: Request) => {
  return request.headers.get("X-Tenant-ID");
};

export const handlers = [
  http.options(/.*/, ({ request }) => {
    const origin = request.headers.get("origin") ?? "*";

    const requestedHeaders =
      request.headers.get("access-control-request-headers") ??
      "content-type, x-tenant-id";

    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": requestedHeaders,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }),

  // GET current room occupants.
  http.get("*/api/rooms/:roomId/occupants", ({ request, params }) => {
    const tenantId = getTenantId(request);
    const roomId = Number(params.roomId);

    console.log("[MSW] Occupants request:", {
      roomId,
      tenantId: request.headers.get("X-Tenant-ID"),
    });

    if (tenantId !== "1" && tenantId !== "2") {
      return HttpResponse.json(
        { message: "Tenant not found." },
        { status: 404 },
      );
    }

    // Mock room ownership:
    // Tenant 1 owns rooms 1 and 2.
    // Tenant 2 owns room 3.
    const ownedRooms = tenantId === "1" ? [1, 2] : [3];

    if (!ownedRooms.includes(roomId)) {
      return HttpResponse.json({ message: "Room not found." }, { status: 404 });
    }

    const occupants = checkIns.filter(
      (checkIn) =>
        checkIn.room_id === roomId && checkIn.checked_out_at === null,
    );

    return HttpResponse.json({
      data: occupants,
    });
  }),

  // POST check-in.
  http.post("*/api/rooms/:roomId/check-ins", async ({ request, params }) => {
    const tenantId = getTenantId(request);
    const roomId = Number(params.roomId);

    if (tenantId !== "1" && tenantId !== "2") {
      return HttpResponse.json(
        { message: "Tenant not found." },
        { status: 404 },
      );
    }

    const ownedRooms = tenantId === "1" ? [1, 2] : [3];

    if (!ownedRooms.includes(roomId)) {
      return HttpResponse.json({ message: "Room not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      child_id?: number;
    };

    const childId = Number(body.child_id);

    const children = tenantId === "1" ? Object.values(mockChildren).flat() : [];

    const child = children.find((item) => item.id === childId);

    if (!child) {
      return HttpResponse.json(
        {
          message: "Validation failed.",
          errors: {
            child_id: ["Child does not belong to this tenant."],
          },
        },
        { status: 422 },
      );
    }

    const alreadyCheckedIn = checkIns.some(
      (item) => item.child_id === childId && item.checked_out_at === null,
    );

    if (alreadyCheckedIn) {
      return HttpResponse.json(
        { message: "Child is already checked into a room." },
        { status: 409 },
      );
    }

    const newCheckIn: CheckIn = {
      id: nextCheckInId++,
      room_id: roomId,
      child_id: child.id,
      child,
      checked_in_at: new Date().toISOString(),
      checked_out_at: null,
    };

    checkIns.push(newCheckIn);

    return HttpResponse.json({ data: newCheckIn }, { status: 201 });
  }),

  // POST check-out.
  http.post("*/api/check-ins/:id/check-out", ({ request, params }) => {
    const tenantId = getTenantId(request);
    const id = Number(params.id);

    if (tenantId !== "1" && tenantId !== "2") {
      return HttpResponse.json(
        { message: "Tenant not found." },
        { status: 404 },
      );
    }

    const checkIn = checkIns.find(
      (item) => item.id === id && item.checked_out_at === null,
    );

    if (!checkIn) {
      return HttpResponse.json(
        { message: "Active check-in not found." },
        { status: 404 },
      );
    }

    // Check ownership of the room before checkout.
    const ownedRooms = tenantId === "1" ? [1, 2] : [3];

    if (!ownedRooms.includes(checkIn.room_id)) {
      return HttpResponse.json(
        { message: "Check-in not found." },
        { status: 404 },
      );
    }

    checkIn.checked_out_at = new Date().toISOString();

    return HttpResponse.json({
      data: checkIn,
    });
  }),
];
