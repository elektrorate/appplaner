export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  color: string;
  avatarBg: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  deletedAt?: string; // ISO date string when moved to trash
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string; // base64 or url
  size?: number;
  uploadedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string; // descripción desplegable
  completed: boolean;
  completedAt?: string;
  attachments?: TaskAttachment[]; // imágenes adjuntas en la subtarea
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO format YYYY-MM-DD or empty
  dueTime?: string; // HH:mm format (e.g., "10:00")
  priority: Priority;
  projectId: string; // 'inbox' or project ID
  assignedTo: string; // userId or 'all'
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  createdBy: string;
  createdAt: string;
  deletedAt?: string; // ISO date string when moved to trash
  tags?: string[];
  subtasks?: SubTask[];
  attachments?: TaskAttachment[];
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'calendar' | 'project' | 'assigned-me' | 'trash';
