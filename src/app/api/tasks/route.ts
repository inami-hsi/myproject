import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/auth";

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]);
const priorityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

const createTaskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().min(1, "プロジェクトIDは必須です"),
  parentId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectIdクエリパラメータは必須です" },
        { status: 400 },
      );
    }

    const user = await getOrCreateDemoUser();

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 },
      );
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        tags: { include: { tag: true } },
        dependencies: true,
        dependents: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateDemoUser();
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { tagIds, startDate, endDate, dueDate, ...taskData } = parsed.data;

    const project = await prisma.project.findFirst({
      where: { id: taskData.projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 },
      );
    }

    const maxSortOrder = await prisma.task.aggregate({
      where: { projectId: taskData.projectId },
      _max: { sortOrder: true },
    });

    const task = await prisma.task.create({
      data: {
        ...taskData,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
        assigneeId: user.id,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        dependencies: true,
        dependents: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 },
    );
  }
}
