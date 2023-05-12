import type { TiktokenModel } from "@dqbd/tiktoken";

export const getModelNameForTiktoken = (modelName: string): TiktokenModel => {
  if (modelName.startsWith("gpt-3.5-turbo-")) {
    return "gpt-3.5-turbo";
  }

  if (modelName.startsWith("gpt-4-32k-")) {
    return "gpt-4-32k";
  }

  if (modelName.startsWith("gpt-4-")) {
    return "gpt-4";
  }

  return modelName as TiktokenModel;
};

export const importTiktoken = async () => {
  try {
    // Dynamic import to avoid bundling tiktoken
    const { encoding_for_model } = await import("@dqbd/tiktoken");
    return { encoding_for_model };
  } catch (error) {
    return { encoding_for_model: null };
  }
};

export const getTokensAmount = async ({
  prompt,
  modelName,
}: {
  prompt: string;
  modelName: string;
}) => {
  const { encoding_for_model } = await importTiktoken();

  // fallback to approximate calculation if tiktoken is not available
  let numTokens = Math.ceil(prompt.length / 4);

  try {
    const encoding = encoding_for_model?.(getModelNameForTiktoken(modelName));
    const tokenized = encoding?.encode(prompt);
    if (tokenized?.length) {
      numTokens = tokenized.length;
    }
  } catch (error) {
    console.error(error);
  }
  return numTokens;
};
