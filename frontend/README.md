# Nursery Room Check-In Dashboard

A React and TypeScript application for nursery staff to manage room occupants. Staff can view children currently checked into a room, check children in, and check them out.

## Tech Stack

- React
- TypeScript
- Vite
- Axios
- MSW (Mock Service Worker)
- Vitest
- React Testing Library

## Features

- View current room occupants.
- Check a child into a room using their child ID.
- Check a child out of a room.
- Display the current occupant count.
- Handle loading, empty, and API error states.
- Support tenant-specific room access.
- Mock backend API requests using MSW.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_TENANT_ID=1
VITE_USE_MOCKS=true
```

`VITE_API_BASE_URL` specifies the backend API base URL.

`VITE_TENANT_ID` identifies the tenant used by the application.

`VITE_USE_MOCKS` enables the mock API configuration.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Mock API Implementation

The frontend uses Mock Service Worker (MSW) to simulate the Laravel backend API.

The mock handlers are defined in:

```text
src/mocks/handlers.ts
```

Mock data is defined in:

```text
src/mocks/data.ts
```

The mock implementation supports:

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | `/api/rooms/{roomId}/occupants` | Get current room occupants |
| POST   | `/api/rooms/{roomId}/check-ins` | Check a child into a room  |
| POST   | `/api/check-ins/{id}/check-out` | Check a child out          |

The mock API maintains in-memory state during the session. Data resets when the application is restarted or the mock data reset function is called.

Tenant validation, room ownership, child validation, and duplicate check-in prevention are included in the mock handlers.

## Running Tests

Run the test suite:

```bash
npm run test:run
```

Run the production build:

```bash
npm run build
```

The project uses Vitest and React Testing Library for component tests.

**Current test status:** 2 tests passing and 4 temporarily skipped. The skipped tests should be revisited before final submission.

## Production Build

To generate production assets:

```bash
npm run build
```

The generated files are placed in:

```text
dist/
```

## Project Structure

```text
src/
├── api/
│   ├── client.ts
│   └── checkInApi.ts
├── components/
├── hooks/
├── mocks/
│   ├── browser.ts
│   ├── data.ts
│   └── handlers.ts
├── pages/
├── test/
├── types/
└── main.tsx
```

## Notes

The frontend uses mocked API responses through MSW, so a running Laravel backend is not required when mock mode is enabled.

The mock API is intended for frontend development and testing. It does not persist data to a database.
