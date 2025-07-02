import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { AxiosError } from "axios";
import { CalendarDays, MapPin, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { format, parseISO, isBefore } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  event_cover: string | null;
  attendees: number[];
  creator: number;
  is_completed: boolean;
  max_attendees?: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

export default function MemberEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsResponse = await API.get<ApiResponse>("/events/");
        setEvents(eventsResponse.data.results);

        // Fetch user registrations
        try {
          const registrations = await API.get<number[]>("/events/my_registrations/");
          setRegisteredEvents(registrations.data);
        } catch (regError) {
          console.log("Could not fetch registrations", regError);
        }
      } catch (error) {
        handleApiError(error, "Failed to load events");
      }
    };
    fetchData();
  }, []);

  const register = async (eventId: number) => {
    setLoading(eventId);
    try {
      await API.post(`/events/${eventId}/register/`, {});
      setRegisteredEvents(prev => [...prev, eventId]);
      toast({
        title: "Registration Successful",
        description: "You've successfully registered for this event",
      });
    } catch (error) {
      handleApiError(error, "Registration failed");
    } finally {
      setLoading(null);
    }
  };

  const handleApiError = (error: unknown, defaultMessage: string) => {
    const axiosError = error as AxiosError<{ error?: string; detail?: string }>;
    toast({
      title: "Error",
      description: axiosError.response?.data?.error || 
                  axiosError.response?.data?.detail || 
                  defaultMessage,
      variant: "destructive",
    });
  };

  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.date);
    const now = new Date();
    
    if (activeTab === "upcoming") {
      return !event.is_completed && isBefore(now, eventDate);
    } else if (activeTab === "past") {
      return event.is_completed || isBefore(eventDate, now);
    }
    return true;
  });

  const getEventStatus = (event: Event) => {
    const eventDate = parseISO(event.date);
    const now = new Date();
    
    if (event.is_completed) return "completed";
    if (isBefore(eventDate, now)) return "past";
    if (event.max_attendees && event.attendees.length >= event.max_attendees) return "full";
    return "upcoming";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discover and join exciting art community events
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <CalendarDays className="w-12 h-12 text-gray-400" />
          <p className="text-lg text-gray-500">No events found</p>
          <Button variant="outline">Check back later</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const status = getEventStatus(event);
            const eventDate = parseISO(event.date);
            const isRegistered = registeredEvents.includes(event.id);
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                {event.event_cover && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={event.event_cover} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={
                        status === "completed" ? "secondary" :
                        status === "past" ? "outline" :
                        status === "full" ? "destructive" : "default"
                      }>
                        {status === "completed" ? "Completed" :
                         status === "past" ? "Past Event" :
                         status === "full" ? "Full" : "Upcoming"}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                    <CalendarDays className="w-4 h-4" />
                    <span>{format(eventDate, "MMMM d, yyyy")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{format(eventDate, "h:mm a")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.max_attendees && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.attendees.length}/{event.max_attendees} attendees
                      </span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button
                    onClick={() => register(event.id)}
                    disabled={status !== "upcoming" || loading === event.id || isRegistered}
                    className="w-full"
                    variant={
                      isRegistered ? "outline" : 
                      status === "full" ? "destructive" : "default"
                    }
                  >
                    {loading === event.id ? (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : status === "completed" ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Event Completed
                      </span>
                    ) : isRegistered ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Registered
                      </span>
                    ) : status === "full" ? (
                      "Event Full"
                    ) : (
                      "Register Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}