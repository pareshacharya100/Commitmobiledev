import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ Set API Base URL to Elastic Beanstalk Backend
export const API_BASE_URL = 'https://my-backend-env.eba-whdzg3qj.us-east-1.elasticbeanstalk.com';

// ✅ Ensure API requests correctly append `/api/`
export function getApiUrl(path: string) {
  return `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
}
