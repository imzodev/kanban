import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tasks?columnId=1 - list tasks for a column
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const columnIdStr = searchParams.get("columnId");
    const columnId = columnIdStr ? Number(columnIdStr) : NaN;
    if (!Number.isFinite(columnId)) return NextResponse.json({ error: "columnId is required" }, { status: 400 });

    const tasks = await prisma.task.findMany({ where: { columnId }, orderBy: { order: "asc" } });
    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks - create task { columnId, title, description?, order? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const columnId = Number(body?.columnId);
    const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : null;
    const description = typeof body?.description === "string" ? body.description : null;
    const order = Number.isFinite(Number(body?.order)) ? Number(body.order) : 0;

    if (!Number.isFinite(columnId)) return NextResponse.json({ error: "columnId is required" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const task = await prisma.task.create({ data: { columnId, title, description, order } });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
