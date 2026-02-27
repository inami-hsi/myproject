import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateMilestoneSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.milestone.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "マイルストーンが見つかりません" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date);
    if (parsed.data.color !== undefined) updateData.color = parsed.data.color;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Failed to update milestone:", error);
    return NextResponse.json(
      { error: "マイルストーンの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.milestone.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "マイルストーンが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.milestone.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete milestone:", error);
    return NextResponse.json(
      { error: "マイルストーンの削除に失敗しました" },
      { status: 500 },
    );
  }
}
