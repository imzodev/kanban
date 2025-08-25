import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/columns?boardId=1 - list columns for a board with tasks
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const boardIdStr = searchParams.get("boardId");
    const boardId = boardIdStr ? Number(boardIdStr) : NaN;
    if (!Number.isFinite(boardId)) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    }
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(columns);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 });
  }
}

// POST /api/columns - create a column { boardId, name, order? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const boardId = Number(body?.boardId);
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : null;
    const order = Number.isFinite(Number(body?.order)) ? Number(body.order) : 0;
    if (!Number.isFinite(boardId)) return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const col = await prisma.column.create({ data: { boardId, name, order } });
    return NextResponse.json(col, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
