import { model } from "@/config";
import { ensureBadTemplates, entityPropSummaryTemplate } from "@/templates";
import { LLMChain, PromptTemplate } from "langchain";

interface Types {
  entity_prop_string_list: string;
  entity_prop_name: string;
}
// Ensure that the response is negative
export const entityPropSummaryChain = async ({
  entity_prop_string_list,
  entity_prop_name,
}: Types) => {
  try {
    const template = PromptTemplate.fromTemplate(entityPropSummaryTemplate[0]);
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });

    const response = (
      (
        await chain.call({
          entity_prop_string_list,
          entity_prop_name,
        })
      ).text as string
    ).replace(/summary\s*:\s*/gi, "");

    const checkAIModelMessage = !!response.match(/ai language model/gi)?.length;

    if (checkAIModelMessage) {
      return false;
    }

    console.log(
      "\x1b[34m%s\x1b[0m",
      `Created summary for ${entity_prop_name}: ${response}`
    );
    return response;
  } catch (err) {
    throw new Error(`Error on ensureNegativeChain: ${err}`);
  }
};
