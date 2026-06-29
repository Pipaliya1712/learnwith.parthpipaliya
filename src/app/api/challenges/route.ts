import { NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/_proxy";

export async function GET(req: NextRequest) {
  return proxyToFastAPI("/challenges", req);
}

export async function POST(req: NextRequest) {
  return proxyToFastAPI("/challenges", req);
}
