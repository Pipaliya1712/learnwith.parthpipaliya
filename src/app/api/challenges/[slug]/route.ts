import { NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/_proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyToFastAPI(`/challenges/${slug}`, req);
}
