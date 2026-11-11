import type { CheckIn, Child, Room } from "../types";

export const mockRooms: Room[] = [
  { id: 1, name: "Sunflowers" },
  { id: 2, name: "Butterflies" },
  { id: 3, name: "Bloom & Grow" },
  { id: 4, name: "Sparkling Stars" },
];

export const mockChildren: Record<number, Child[]> = {
  1: [
    { id: 1, name: "Ali" },
    { id: 2, name: "Sara" },
    { id: 3, name: "Ahmed" },
    { id: 4, name: "Zoya" },
  ],
  2: [
    { id: 5, name: "Ayaan" },
    { id: 6, name: "Maya" },
  ],
  3: [
    { id: 7, name: "Layla" },
    { id: 8, name: "Noah" },
  ],
  4: [
    { id: 9, name: "Emma" },
    { id: 10, name: "Oliver" },
  ],
};

export const initialCheckIns: CheckIn[] = [
  {
    id: 1,
    room_id: 1,
    child_id: 1,
    child: { id: 1, name: "Ali" },
    checked_in_at: "2026-11-11T08:30:00.000Z",
    checked_out_at: null,
  },
  {
    id: 2,
    room_id: 1,
    child_id: 2,
    child: { id: 2, name: "Sara" },
    checked_in_at: "2026-11-11T09:00:00.000Z",
    checked_out_at: null,
  },
  {
    id: 3,
    room_id: 2,
    child_id: 5,
    child: { id: 5, name: "Ayaan" },
    checked_in_at: "2026-11-11T08:45:00.000Z",
    checked_out_at: null,
  },
  {
    id: 4,
    room_id: 3,
    child_id: 7,
    child: { id: 7, name: "Layla" },
    checked_in_at: "2026-11-11T09:15:00.000Z",
    checked_out_at: null,
  },
  {
    id: 5,
    room_id: 4,
    child_id: 9,
    child: { id: 9, name: "Emma" },
    checked_in_at: "2026-11-11T08:30:00.000Z",
    checked_out_at: null,
  },
];
