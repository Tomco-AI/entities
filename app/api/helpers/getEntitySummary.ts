import { model } from "@/config";
import { entitySummaryTemplate } from "@/templates";
import { LLMChain, PromptTemplate } from "langchain";
import { generateCallArguments } from "./generateCallArguments";

interface Types {
  entity_name: string;
}

export const getEntitySummaryChain = async ({ entity_name }: Types) => {
  try {
    const template = PromptTemplate.fromTemplate(entitySummaryTemplate[0]);
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });

    const entityPropValues = generateCallArguments(entity_name);
    const response = (
      (
        await chain.call({
          entity_prop_name: entity_name,
          you_ares: entityPropValues.callArgs.you_are,
          negative_you_ares: entityPropValues.callArgs.negative_you_are,
          goals: entityPropValues.callArgs.goal,
          negative_goals: entityPropValues.callArgs.negative_goal,
          questions_to_yourself: entityPropValues.callArgs.questions_to_yourself,
          negative_questions_to_yourself:
            entityPropValues.callArgs.negative_questions_to_yourself,
            previous_thoughts: entityPropValues.callArgs.previous_thoughts,
          previous_negative_thoughts:
            entityPropValues.callArgs.previous_negative_thoughts,
        })
      ).text as string
    ).replace(/summary\s*:\s*/gi, "");

    console.log(
      "\x1b[34m%s\x1b[0m",
      `Created summary for ${entity_name}: ${response}`
    );
    return response;
  } catch (err) {
    throw new Error(`Error on getEntitySummary: ${err}`);
  }
};
