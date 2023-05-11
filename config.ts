import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Configuration, OpenAIApi } from "openai";

// Open API configuration. Util to create embeddings.
export const embeddingModel = "text-embedding-ada-002";
export const openAIApiConfig = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(openAIApiConfig);

// Model configuration. Util to create vector stores.
export const embeddings = new OpenAIEmbeddings({
  maxRetries: 1,
});
export const model = new OpenAI({
  temperature: 1,
  modelName: "gpt-3.5-turbo",
  maxRetries: 1,
});
export const getModel = (args: ConstructorParameters<typeof OpenAI>[0]) =>
  new OpenAI(args);
