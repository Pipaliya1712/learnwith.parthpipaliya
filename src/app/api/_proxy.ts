import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

type ProxyOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

export async function proxyToFastAPI(
  path: string,
  req: NextRequest,
  opts: ProxyOptions = {}
): Promise<NextResponse> {
  const { method, headers: extraHeaders = {}, body } = opts;

  const reqHeaders: Record<string, string> = { ...extraHeaders };

  const contentType = req.headers.get("content-type");
  if (contentType) reqHeaders["Content-Type"] = contentType;

  // Always attach JWT if it exists. Let FastAPI enforce the rules.
  const token = await getToken();
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  let requestBody: BodyInit | null | undefined = body;
  if (requestBody === undefined) {
    const ct = contentType || "";
    if (ct.includes("application/json") || ct.includes("multipart/form-data")) {
      requestBody = req.body;
    }
  }

  try {
    const upstream = await fetch(`${FASTAPI_BASE}${path}`, {
      method: method || req.method,
      headers: reqHeaders,
      body: requestBody,
      // @ts-ignore — duplex is required for streaming body in Node 18+
      duplex: "half",
    });

    const responseBody = await upstream.text();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error(`[Proxy] Failed to reach FastAPI at ${FASTAPI_BASE}${path}:`, err);
    return NextResponse.json(
      { error: "Backend service unavailable. Please try again later." },
      { status: 502 }
    );
  }
}
