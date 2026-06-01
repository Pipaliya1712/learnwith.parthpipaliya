import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../../_proxy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  return proxyToFastAPI(`/auth/${path}`, req);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  return proxyToFastAPI(`/auth/${path}`, req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  return proxyToFastAPI(`/auth/${path}`, req);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  return proxyToFastAPI(`/auth/${path}`, req);
}
