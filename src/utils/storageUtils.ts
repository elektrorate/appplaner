/**
 * Safe localStorage utilities with automatic QuotaExceededError protection and recovery.
 */

import { Task } from '../types';

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: unknown) {
    console.warn(`[Storage] localStorage.setItem failed for key "${key}". Attempting quota recovery...`, error);

    try {
      // If it's a tasks array, we can sanitize or truncate oversized attachment payloads
      if (key.includes('tasks')) {
        const parsed: Task[] = JSON.parse(value);
        const sanitizedTasks = parsed.map((task) => {
          // If attachments are too large, downscale or prune them
          const sanitizedAttachments = (task.attachments || []).map((att) => ({
            ...att,
            // Keep URL if reasonable, or trim if gigantic
            url: att.url.length > 500000 ? att.url.slice(0, 10000) : att.url,
          }));

          const sanitizedSubtasks = (task.subtasks || []).map((sub) => ({
            ...sub,
            attachments: (sub.attachments || []).map((att) => ({
              ...att,
              url: att.url.length > 500000 ? att.url.slice(0, 10000) : att.url,
            })),
          }));

          return {
            ...task,
            attachments: sanitizedAttachments,
            subtasks: sanitizedSubtasks,
          };
        });

        localStorage.setItem(key, JSON.stringify(sanitizedTasks));
        return true;
      }
    } catch (recoveryError) {
      console.error('[Storage] Quota recovery also failed:', recoveryError);
    }
    return false;
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[Storage] Failed to read key "${key}" from localStorage:`, error);
    return fallback;
  }
}
