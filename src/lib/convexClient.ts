import { ConvexReactClient } from "convex/react";

const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  "https://brazen-fly-914.convex.cloud";

export const isConvexEnabled = Boolean(convexUrl && convexUrl.startsWith("https://"));

export const convex = new ConvexReactClient(convexUrl);
