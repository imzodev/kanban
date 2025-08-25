import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/boards - list boards with columns and tasks
export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { id: "asc" },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: { tasks: { orderBy: { order: "asc" } } },
        },
      },
    });
    return NextResponse.json(boards);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

// POST /api/boards - create a new board { name }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : null;
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const board = await prisma.board.create({ data: { name } });
    return NextResponse.json(board, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
