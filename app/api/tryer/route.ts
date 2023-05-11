import { model } from "@/config";
import { LLMChain, PromptTemplate } from "langchain";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = await request.json();

  const template = body.template as string;
  const inputValues = body.inputValues as Record<string, string>;

  const chain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(template),
  });

  const response = await chain.call(inputValues);

  return NextResponse.json({ data: response });
};
