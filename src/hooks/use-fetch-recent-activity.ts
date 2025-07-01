// src/hooks/use-fetch-recent-activity.ts
import { useEffect, useState } from "react";
import API from "../lib/api";
import type { ActivityType, ActivityStatus } from "../types";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  status?: ActivityStatus;
}

export function useFetchRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await API.get("/activity/recent/");
        
        // Transform API response to our ActivityItem format
        const formattedActivities: ActivityItem[] = res.data.map((item: any) => {
          // Validate activity_type
          const validActivityTypes: ActivityType[] = [
            'approval',
            'rejection',
            'pending',
            'registration',
            'artwork',
            'event',
            'project',
            'announcement',
            'warning',
            'success'
          ];
          const activityType = validActivityTypes.includes(item.activity_type)
            ? (item.activity_type as ActivityType)
            : 'pending'; // Fallback to 'pending'

          // Validate status
          const validStatuses: ActivityStatus[] = ['completed', 'pending', 'failed', 'info'];
          const activityStatus = item.status && validStatuses.includes(item.status)
            ? (item.status as ActivityStatus)
            : undefined; // Fallback to undefined if status is invalid

          return {
            id: item.id,
            type: activityType,
            title: item.description,
            user: item.user
              ? {
                  name: `${item.user.first_name} ${item.user.last_name}`,
                  avatar: item.user.profile_picture
                }
              : undefined,
            timestamp: item.created_at,
            status: activityStatus
          };
        });

        setActivities(formattedActivities);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError("Failed to load recent activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, loading, error };
}