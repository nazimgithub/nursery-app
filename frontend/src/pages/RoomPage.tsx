import { useRoomOccupants } from "../hooks/useRoomOccupants";

import RoomHeader from "../components/RoomHeader";
import OccupantCard from "../components/OccupantCard";
import CheckInForm from "../components/CheckInForm";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function RoomPage() {
  const roomId = 1;
  const roomName = "Sunflowers";

  const { occupants, loading, submitting, error, checkIn, checkOut, refresh } =
    useRoomOccupants(roomId);

  return (
    <main className="dashboard">
      <RoomHeader roomName={roomName} occupantCount={occupants.length} />

      <CheckInForm onCheckIn={checkIn} submitting={submitting} />

      {error && <ErrorState message={error} onRetry={refresh} />}

      <section className="occupants-section">
        <div className="section-heading">
          <div>
            <h2>Room occupants</h2>
            <p>Children currently checked into this room.</p>
          </div>

          <span className="count-badge">{occupants.length} children</span>
        </div>

        {loading ? (
          <LoadingState />
        ) : occupants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="occupant-list">
            {occupants.map((item) => (
              <OccupantCard
                key={item.id}
                checkIn={item}
                onCheckOut={checkOut}
                disabled={submitting}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
