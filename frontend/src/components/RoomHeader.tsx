import { Users, Building2 } from "lucide-react";

interface Props {
  roomName: string;
  occupantCount: number;
}

export default function RoomHeader({ roomName, occupantCount }: Props) {
  return (
    <header className="room-header">
      <div>
        <div className="eyebrow">
          <Building2 size={16} />
          NURSERY MANAGEMENT
        </div>

        <h1>{roomName}</h1>
        <p>Manage children currently in this room.</p>
      </div>

      <div className="occupancy-card">
        <Users size={22} />
        <div>
          <strong>{occupantCount}</strong>
          <span>Current occupants</span>
        </div>
      </div>
    </header>
  );
}
