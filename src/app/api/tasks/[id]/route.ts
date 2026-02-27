import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/auth";

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]);
const priorityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().optional(),
  projectId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        dependencies: true,
        dependents: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    const { tagIds, startDate, endDate, dueDate, ...taskData } = parsed.data;

    const updateData: Record<string, unknown> = { ...taskData };

    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (tagIds !== undefined) {
      await prisma.tagOnTask.deleteMany({ where: { taskId: id } });
      if (tagIds.length > 0) {
        await prisma.tagOnTask.createMany({
          data: tagIds.map((tagId) => ({ taskId: id, tagId })),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        tags: { include: { tag: true } },
        dependencies: true,
        dependents: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
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

    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 },
    );
  }
}
