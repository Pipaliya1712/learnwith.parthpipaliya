import { NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/_proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyToFastAPI(`/challenges/slug/${slug}`, req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyToFastAPI(`/challenges/${slug}`, req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyToFastAPI(`/challenges/${slug}`, req);
}
