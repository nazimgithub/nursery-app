interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}
