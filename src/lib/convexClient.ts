import { ConvexReactClient } from "convex/react";

// Check if Convex URL is properly configured
const convexUrl = import.meta.env.VITE_CONVEX_URL;
export const isConvexEnabled = convexUrl && convexUrl !== "your-convex-url-here" && convexUrl.startsWith("https://");

// Initialize Convex client only if URL is valid
export const convex = isConvexEnabled 
  ? new ConvexReactClient(convexUrl as string)
  : null;
