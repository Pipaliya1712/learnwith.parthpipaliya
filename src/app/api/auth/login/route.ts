import { NextRequest, NextResponse } from "next/server";
import { proxyToFastAPI } from "../../_proxy";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  // We need to clone the request because we want to proxy it,
  // but proxyToFastAPI will read the body stream.
  // Instead, we just let proxyToFastAPI forward it, and we intercept the response.
  
  const response = await proxyToFastAPI("/auth/login", req);

  if (response.ok) {
    // We need to extract the token and set the cookie.
    // However, the NextResponse from proxyToFastAPI has already been created.
    // We can clone it, read the JSON, set the cookie on a new response.
    const data = await response.clone().json();
    if (data && data.access_token) {
      // Decode JWT slightly to get exp, or just use stay_logged_in flag
      // Let's just pass a default maxAge and let the server session function handle it.
      // But we can check if it's long-lived by checking exp in token.
      let maxAge = 60 * 60; // 1 hour default
      try {
        const payloadStr = Buffer.from(data.access_token.split('.')[1], 'base64').toString();
        const payload = JSON.parse(payloadStr);
        if (payload.exp) {
          maxAge = payload.exp - Math.floor(Date.now() / 1000);
        }
      } catch (e) {
        // ignore
      }

      await createSession(data.access_token, maxAge);
    }
  }

  return response;
}
