import { model } from "@/config";
import { ensureBadTemplates } from "@/templates";
import { LLMChain, PromptTemplate } from "langchain";

interface Types {
  text: string;
}
// Ensure that the response is negative
export const ensureNegativeChain = async ({ text }: Types) => {
  try {
    const template = PromptTemplate.fromTemplate(ensureBadTemplates[0]);
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });

    const response = (
      await chain.call({
        text,
      })
    ).text as string;
    const checkAIModelMessage = !!response.match(/ai language model/gi)?.length;

    if (checkAIModelMessage) {
      return false;
    }

    return response;
  } catch (err) {
    throw new Error(`Error on ensureNegativeChain: ${err}`);
  }
};
