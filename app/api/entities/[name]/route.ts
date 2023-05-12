import { NextResponse } from "next/server";
import fs from "fs";
import { baseFolder, entity_props_names } from "@/constants";
import {
  EntityPropNamesType,
  evolveEntityPropChain,
} from "../../helpers/evolveEntityPropChain";

/**
 * Create new entity
 */
export async function PUT(request: Request, { params }: any) {
  const name = params.name;
  const body = await request.json();
  let iterations = 1;

  if (body.iterations && body.iterations > 10) {
    return NextResponse.json(
      {
        message: "Iterations limit exceeded",
      },
      { status: 400 }
    );
  }

  if (typeof body.iterations === "number") {
    iterations = body.iterations;
  } else {
    return NextResponse.json(
      {
        message: "Iterations must be a number",
      },
      { status: 400 }
    );
  }

  const existsEntity = fs.existsSync(`${baseFolder}/${name}`);

  if (!existsEntity) {
    return NextResponse.json(
      {
        message: "Entity not found",
      },
      { status: 404 }
    );
  }

  const returnObj: Partial<Record<EntityPropNamesType, string[]>> = {};

  for (let i = 0; i < iterations; i++) {
    console.log("\x1b[35m%s\x1b[0m", `\n\nIteration ${i + 1} of ${iterations}\n\n`);
    for (let entity_prop_name of entity_props_names) {
      const evolveEntityPropResult = await evolveEntityPropChain({
        entity_prop_name,
        entity_name: name,
      });
      returnObj[entity_prop_name] = evolveEntityPropResult;
    }
  }

  const response = {
    message: `Entity ${name} updated`,
    data: { ...returnObj },
  };

  return NextResponse.json({ data: response });
}
