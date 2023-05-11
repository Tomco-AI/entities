import { NextResponse } from "next/server";
import fs from "fs";
import {
  baseFolder,
} from "@/constants";
import { ListTypes, executeChain } from "../../helpers/executeChain";

/**
 * Create new entity
 */
export async function PUT(request: Request, { params }: any) {
  const name = params.name;

  const existsEntity = fs.existsSync(`${baseFolder}/${name}`);

  if (!existsEntity) {
    return NextResponse.json(
      {
        message: "Entity not found",
      },
      { status: 404 }
    );
  }

  const list_types: ListTypes[] = [
    "questions",
    "negative_questions",
    "thoughts",
    "negative_thoughts",
    "goals",
    "negative_goals",
    "you_ares",
    "negative_you_ares",
  ];
  
  const returnObj: Partial<Record<ListTypes, string[]>> = {};
  await Promise.all(
    list_types.map(async (list_type) => {
      const executorResult = await executeChain({
        list_type,
        entity_name: name,
      });
      returnObj[list_type] = executorResult;
    })
  );

  const response = {
    message: `Entity ${name} updated`,
    data: { ...returnObj },
  };

  return NextResponse.json({ data: response });
}
