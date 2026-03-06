import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/auth";

const createMilestoneSchema = z.object({
  name: z.string().min(1, "マイルストーン名は必須です"),
  date: z.string().datetime(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  projectId: z.string().min(1, "プロジェクトIDは必須です"),
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 },
      );
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Failed to fetch milestones:", error);
    return NextResponse.json(
      { error: "マイルストーンの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateDemoUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = createMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: parsed.data.projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 },
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        name: parsed.data.name,
        date: new Date(parsed.data.date),
        color: parsed.data.color,
        projectId: parsed.data.projectId,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return NextResponse.json(
      { error: "マイルストーンの作成に失敗しました" },
      { status: 500 },
    );
  }
}
