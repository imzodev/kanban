import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (Number.isFinite(Number(body?.order))) data.order = Number(body.order);
    if (Number.isFinite(Number(body?.boardId))) data.boardId = Number(body.boardId);

    const col = await prisma.column.update({ where: { id }, data });
    return NextResponse.json(col);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    await prisma.column.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
