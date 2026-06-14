import { NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/_proxy";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ submission_id: string }> }) {
  const { submission_id } = await params;
  return proxyToFastAPI(`/submissions/${submission_id}/review`, req);
}
