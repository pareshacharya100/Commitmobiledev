import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//export const API_BASE_URL = 'http://0.0.0.0:5000';
// utils.ts or wherever the API base URL is set
export const API_BASE_URL = 'https://g54o6fybobhj3hc2v24z6guqhi.appsync-api.us-east-1.amazonaws.com/graphql';

export function getApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}