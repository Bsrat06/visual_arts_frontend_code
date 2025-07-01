// src/types.ts
export type ActivityType = 
  | 'approval' 
  | 'rejection' 
  | 'pending' 
  | 'registration' 
  | 'artwork' 
  | 'event' 
  | 'project' 
  | 'announcement' 
  | 'warning' 
  | 'success';

export type ActivityStatus = 
  | 'completed' 
  | 'pending' 
  | 'failed' 
  | 'info';