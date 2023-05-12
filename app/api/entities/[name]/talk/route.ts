import { getEntitySummaryChain } from "@/app/api/helpers/getEntitySummary";
import { NextResponse } from "next/server";

export const POST = async (request: Request, { params }: any) => {
  const { name } = params;
  const body = await request.json();
  let prompt = body.prompt;

  if (!prompt) {
    return NextResponse.json(
      {
        message: "Prompt is required",
      },
      { status: 400 }
    );
  }

  await getEntitySummaryChain({ entity_name: name });
};
