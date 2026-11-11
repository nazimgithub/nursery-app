import { Users } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="state-container">
      <Users size={42} />
      <h3>No children in this room</h3>
      <p>Check a child in to get started.</p>
    </div>
  );
}
