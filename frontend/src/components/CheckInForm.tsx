import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

interface Props {
  onCheckIn: (childId: number) => Promise<boolean>;
  submitting: boolean;
}

export default function CheckInForm({ onCheckIn, submitting }: Props) {
  const [childId, setChildId] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const id = Number(childId);

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    const success = await onCheckIn(id);

    if (success) {
      setChildId("");
    }
  };

  return (
    <form className="checkin-form" onSubmit={handleSubmit}>
      <div>
        <h2>Check in a child</h2>
        <p>Enter the child's ID to add them to this room.</p>
      </div>

      <div className="form-controls">
        <input
          type="number"
          min="1"
          value={childId}
          onChange={(event) => setChildId(event.target.value)}
          placeholder="Enter child ID"
          aria-label="Child ID"
          required
        />

        <button type="submit" disabled={submitting || !childId}>
          <UserPlus size={18} />
          {submitting ? "Processing..." : "Check in"}
        </button>
      </div>
    </form>
  );
}
