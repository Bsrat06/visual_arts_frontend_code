import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar, MapPin, Users, ArrowRight, Loader2, ImageIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  event_cover: string | null;
  is_registered?: boolean;
  registration_deadline?: string | null;
  capacity?: number | null;
  attendees_count: number;
  gallery?: { image: string; caption?: string }[];
}

export default function VisitorEvents() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [unregistering, setUnregistering] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const endpoint = tab === "upcoming" ? "/events/upcoming/" : "/past-events/";
        const res = await API.get(endpoint);
        let data = res.data.results || res.data;

        if (tab === "upcoming" && user) {
          const registeredRes = await API.get("/events/registered/");
          const registeredIds = new Set(registeredRes.data.map((e: any) => e.id));
          data = data.map((e: Event) => ({ ...e, is_registered: registeredIds.has(e.id) }));
        }

        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [tab, user]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleRegister = async (id: number) => {
    setRegistering(id);
    try {
      await API.post(`/events/${id}/register/`);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_registered: true, attendees_count: e.attendees_count + 1 } : e
        )
      );
      toast.success("Registered successfully");
    } catch {
      toast.error("Registration failed");
    } finally {
      setRegistering(null);
    }
  };

  const handleUnregister = async (id: number) => {
    setUnregistering(id);
    try {
      await API.post(`/events/${id}/unregister/`);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_registered: false, attendees_count: e.attendees_count - 1 } : e
        )
      );
      toast.success("Unregistered successfully");
    } catch {
      toast.error("Unregistration failed");
    } finally {
      setUnregistering(null);
    }
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="overflow-hidden group hover:shadow-md transition-all">
      <div className="aspect-video relative">
        {event.event_cover ? (
          <img src={event.event_cover} alt={event.title} className="object-cover w-full h-full" />
        ) : (
          <div className="bg-muted flex items-center justify-center h-full">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-base">{event.title}</CardTitle>
          {event.is_registered && tab === "upcoming" && <Badge>Registered</Badge>}
        </div>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 mt-0.5" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 mt-0.5" />
          <span>{event.attendees_count} attending</span>
        </div>
      </CardContent>

      {tab === "upcoming" && (
        <CardFooter>
          {user ? (
            event.is_registered ? (
              <Button
                variant="outline"
                onClick={() => handleUnregister(event.id)}
                disabled={!!unregistering}
                className="w-full"
              >
                {unregistering === event.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Unregister
              </Button>
            ) : (
              <Button
                onClick={() => handleRegister(event.id)}
                disabled={!!registering}
                className="w-full"
              >
                {registering === event.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Register
              </Button>
            )
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full" disabled>
                  <ArrowRight className="mr-2 w-4 h-4" /> Register
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Please login to register</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      )}

      {tab === "past" && event.gallery?.length > 0 && (
        <CardFooter className="flex flex-col items-start space-y-2">
          <h4 className="font-semibold text-sm text-foreground">Highlights:</h4>
          <div className="grid grid-cols-2 gap-2">
            {event.gallery.slice(0, 4).map((photo, i) => (
              <div key={i} className="relative group">
                <img
                  src={photo.image}
                  alt={photo.caption || "Event photo"}
                  className="w-full h-24 object-cover rounded"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Explore upcoming and past art events</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[320px] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(renderEventCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[320px] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(renderEventCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
