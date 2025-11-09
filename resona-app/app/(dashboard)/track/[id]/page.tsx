export default async function TrackPage({ params }: { params: { id: string } }) {
  const trackId = params.id;
  return (
    <div>
      <h1>Track ID: {trackId}</h1>
      <p>Track details will go here</p>
    </div>
  );
}