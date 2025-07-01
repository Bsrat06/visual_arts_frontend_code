import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  event_cover?: string;
};

type GalleryImage = {
  id: number;
  image: string;
  caption: string;
};

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventAndGallery = async () => {
      try {
        const [eventRes, galleryRes] = await Promise.all([
          API.get(`/events/${id}/`),
          API.get(`/event-images/?event=${id}`)
        ]);
        setEvent(eventRes.data);
        setGallery(galleryRes.data.results || galleryRes.data); // paginated or flat
      } catch (error) {
        console.error("Error loading event details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndGallery();
  }, [id]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!event) {
    return <p>Event not found.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground">{event.description}</p>
        <p className="text-sm text-gray-600">{event.location} – {new Date(event.date).toLocaleString()}</p>
      </div>

      {event.event_cover && (
        <img
          src={event.event_cover}
          alt="Event Cover"
          className="w-full max-h-[400px] object-cover rounded-md"
        />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Event Highlights</h2>
        {gallery.length === 0 ? (
          <p className="text-muted-foreground">No event photos available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <img
                  src={img.image}
                  alt={img.caption}
                  className="w-full h-48 object-cover"
                />
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-sm truncate">{img.caption}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
