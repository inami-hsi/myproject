import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getQuestionByStep,
  saveResponses,
  getResponses,
} from "@/lib/questionnaire/engine";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const step = searchParams.get("step");
  const insuranceType = searchParams.get("type") || "auto";

  if (!step) {
    return NextResponse.json(
      { error: "Step parameter required" },
      { status: 400 }
    );
  }

  const question = getQuestionByStep(insuranceType, parseInt(step));
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const responses = await getResponses(user.id, insuranceType);

  return NextResponse.json({
    question,
    responses: responses || {},
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { insuranceType, responses } = body;

  if (!insuranceType || !responses) {
    return NextResponse.json(
      { error: "insuranceType and responses required" },
      { status: 400 }
    );
  }

  try {
    await saveResponses(user.id, insuranceType, responses);
    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json(
      { error: "Failed to save responses" },
      { status: 500 }
    );
  }
}
