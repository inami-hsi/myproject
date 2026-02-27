import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/auth";

const createCommentSchema = z.object({
  content: z.string().min(1, "コメント内容は必須です"),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getOrCreateDemoUser();
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId: id,
        userId: user.id,
      },
      include: { user: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "コメントの作成に失敗しました" },
      { status: 500 },
    );
  }
}
