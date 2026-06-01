import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../../_proxy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join("/") : "";
  return proxyToFastAPI(`/users${path ? `/${path}` : ""}`, req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join("/") : "";
  return proxyToFastAPI(`/users${path ? `/${path}` : ""}`, req);
}
