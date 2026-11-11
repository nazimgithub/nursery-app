import { Clock, LogOut, User } from "lucide-react";
import type { CheckIn } from "../types";

interface Props {
  checkIn: CheckIn;
  onCheckOut: (id: number) => void;
  disabled: boolean;
}

export default function OccupantCard({ checkIn, onCheckOut, disabled }: Props) {
  const formattedTime = new Date(checkIn.checked_in_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="occupant-card">
      <div className="child-avatar">
        <User size={24} />
      </div>

      <div className="child-info">
        <h3>{checkIn.child?.name ?? `Child #${checkIn.child_id}`}</h3>

        <p>
          <Clock size={14} />
          Checked in at {formattedTime}
        </p>
      </div>

      <span className="status-badge">Present</span>

      <button
        className="checkout-button"
        disabled={disabled}
        onClick={() => onCheckOut(checkIn.id)}
      >
        <LogOut size={16} />
        Check out
      </button>
    </article>
  );
}
