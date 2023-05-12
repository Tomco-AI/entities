import { NextResponse } from "next/server";
import fs from "fs";
import { baseFolder } from "@/constants";
import {
  EntityPropNamesType,
  evolveEntityPropChain,
} from "../../helpers/evolveEntityPropChain";

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

  const entity_props_names: EntityPropNamesType[] = [
    "questions",
    "negative_questions",
    "thoughts",
    "negative_thoughts",
    "goals",
    "negative_goals",
    "you_ares",
    "negative_you_ares",
  ];

  const returnObj: Partial<Record<EntityPropNamesType, string[]>> = {};
  // await Promise.all(
  //   entity_props_names.map(async (entity_prop_name) => {
  //     const evolveEntityPropResult = await evolveEntityPropChain({
  //       entity_prop_name,
  //       entity_name: name,
  //     });
  //     returnObj[entity_prop_name] = evolveEntityPropResult;
  //   })
  // );
  for (let entity_prop_name of entity_props_names) {
    const evolveEntityPropResult = await evolveEntityPropChain({
      entity_prop_name,
      entity_name: name,
    });
    returnObj[entity_prop_name] = evolveEntityPropResult;
  }

  const response = {
    message: `Entity ${name} updated`,
    data: { ...returnObj },
  };

  return NextResponse.json({ data: response });
}
