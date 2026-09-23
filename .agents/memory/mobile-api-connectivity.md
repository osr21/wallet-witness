---
name: Mobile API connectivity
description: How the mobile Expo app connects to the shared API server, and the web-preview CORS behavior
---

The mobile app calls the API server using `setBaseUrl` from `@workspace/api-client-react`.

In `app/_layout.tsx` (module level, outside component):
```ts
if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}
```

`EXPO_PUBLIC_DOMAIN` is injected from `$REPLIT_DEV_DOMAIN` by the dev script in package.json.

**Web preview CORS:** The Expo web preview runs from `*.expo.kirk.replit.dev` while the API server is at `*.kirk.replit.dev`. The API server uses `cors()` (allow-all) but the routing proxy may strip CORS headers when the API server is down. Always ensure the API Server workflow is running before testing the web preview.

**Why:** On native (iOS/Android via Expo Go), CORS doesn't apply — native HTTP requests bypass browser same-origin policy. The CORS issue only affects the web preview.
