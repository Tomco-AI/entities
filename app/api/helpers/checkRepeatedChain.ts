import { model } from "@/config";
import { checkRepeatedTemplates } from "@/templates";
import { LLMChain, PromptTemplate } from "langchain";

interface Types {
  list_type: string;
  list: string[];
  item: string;
}
export const checkRepeatedChain = async ({ list_type, list, item }: Types) => {
  try {
    const template = PromptTemplate.fromTemplate(checkRepeatedTemplates[0]);
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });

    const response = await chain.call({
      list,
      list_type,
      item,
    });
    const checkRepeatedBool: boolean = !!(response.text as string).match(
      /yes/gi
    )?.length;
    return checkRepeatedBool;
  } catch (err) {
    throw new Error(`Error on checkRepeatedChain: ${err}`);
  }
};
