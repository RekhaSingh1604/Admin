export default function Loading({
  text = "Loading...",
}) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}