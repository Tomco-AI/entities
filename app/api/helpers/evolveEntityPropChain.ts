import { model } from "@/config";
import {
  baseFolder,
  entityPropsMaxTokens,
  goalsFileName,
  negativeGoalsFileName,
  negativeQuestionsFileName,
  negativeThoughtsFileName,
  negativeYouAresFileName,
  questionsFileName,
  thoughtsFileName,
  youAresFileName,
} from "@/constants";
import {
  questionsToYourselfTemplates,
  negativeQuestionsToYourselfTemplates,
  newThoughtTemplates,
  newNegativeThoughtTemplates,
  goalTemplates,
  negativeGoalTemplates,
  youAreTemplates,
  negativeYouAreTemplates,
  ensureBadTemplates,
} from "@/templates";
import fs from "fs";
import { LLMChain, PromptTemplate } from "langchain";
import { generateCallArguments } from "./generateCallArguments";
import { checkRepeatedChain } from "./checkRepeatedChain";
import { ensureNegativeChain } from "./ensureNegativeChain";
import { getTokensAmount } from "@/deprecated-to-start/getTokens";
import { entityPropSummaryChain } from "./entityPropSummaryChain";

export type EntityPropNamesType =
  | "questions"
  | "negative_questions"
  | "thoughts"
  | "negative_thoughts"
  | "goals"
  | "negative_goals"
  | "you_ares"
  | "negative_you_ares";

interface Types {
  entity_prop_name: EntityPropNamesType;
  entity_name: string;
}

const getCallArgKey = (entity_prop_name: EntityPropNamesType) => {
  switch (entity_prop_name) {
    case "questions":
      return "questions_to_yourself";
    case "negative_questions":
      return "negative_questions_to_yourself";
    case "thoughts":
      return "previous_thoughts";
    case "negative_thoughts":
      return "previous_negative_thoughts";
    case "goals":
      return "goal";
    case "negative_goals":
      return "negative_goal";
    case "you_ares":
      return "you_are";
    case "negative_you_ares":
      return "negative_you_are";
  }
};

// Get file name for a given property
const getFileName = (entity_prop_name: EntityPropNamesType) => {
  switch (entity_prop_name) {
    case "questions":
      return questionsFileName;
    case "negative_questions":
      return negativeQuestionsFileName;
    case "thoughts":
      return thoughtsFileName;
    case "negative_thoughts":
      return negativeThoughtsFileName;
    case "goals":
      return goalsFileName;
    case "negative_goals":
      return negativeGoalsFileName;
    case "you_ares":
      return youAresFileName;
    case "negative_you_ares":
      return negativeYouAresFileName;
  }
};

// Get template for a given property
const getTemplate = (entity_prop_name: EntityPropNamesType) => {
  switch (entity_prop_name) {
    case "questions":
      return questionsToYourselfTemplates[0];
    case "negative_questions":
      return negativeQuestionsToYourselfTemplates[0];
    case "thoughts":
      return newThoughtTemplates[0];
    case "negative_thoughts":
      return newNegativeThoughtTemplates[0];
    case "goals":
      return goalTemplates[0];
    case "negative_goals":
      return negativeGoalTemplates[0];
    case "you_ares":
      return youAreTemplates[0];
    case "negative_you_ares":
      return negativeYouAreTemplates[0];
    default:
      return false;
  }
};

const getNiceName = (entity_prop_name: EntityPropNamesType) => {
  switch (entity_prop_name) {
    case "questions":
      return "questions";
    case "negative_questions":
      return "negative questions";
    case "thoughts":
      return "thoughts";
    case "negative_thoughts":
      return "negative thoughts";
    case "goals":
      return "goals";
    case "negative_goals":
      return "negative goals";
    case "you_ares":
      return "personality characteristics";
    case "negative_you_ares":
      return "negative personality characteristics";
  }
};

// Evolves a property given to entity (e.g. questions, thoughts, etc.)
export const evolveEntityPropChain = async ({
  entity_prop_name,
  entity_name,
}: Types) => {
  const entityPropValues = generateCallArguments(entity_name);
  const entityFolder = `${baseFolder}/${entity_name}`;
  const callArgKey = getCallArgKey(entity_prop_name);
  const fileName = getFileName(entity_prop_name);
  const isNegativeProp = !!entity_prop_name.match(/negative/gi)?.length;
  const entity_prop_nice_name = getNiceName(entity_prop_name);
  const thisStringList = entityPropValues.callArgs[callArgKey];

  // Check entity prop list tokens
  if (thisStringList) {
    if (thisStringList.length / 4 > entityPropsMaxTokens) {
      const stringListTokens = await getTokensAmount({
        prompt: thisStringList,
        modelName: model.modelName,
      });
      if (stringListTokens > entityPropsMaxTokens) {
        const listSummary = await entityPropSummaryChain({
          entity_prop_string_list: thisStringList,
          entity_prop_name: entity_prop_nice_name,
        });

        if (listSummary) {
          // Replace the list with the summary
          fs.writeFileSync(
            `${entityFolder}/${fileName}`,
            JSON.stringify([listSummary], null, 2)
          );
          entityPropValues.lists[callArgKey] = [listSummary];
        }
      }
    }
  }

  if (getTemplate(entity_prop_name)) {
    const template = PromptTemplate.fromTemplate(
      getTemplate(entity_prop_name) as string
    );
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });
    const newItem = (await chain.call(entityPropValues.callArgs)).text;
    const thisList = entityPropValues.lists[callArgKey];

    // Check if item is repeated
    const checkRepeated = await checkRepeatedChain({
      list_type: "questions",
      list: thisList,
      item: newItem,
    });

    // Check if AI created a stupid answer
    const checkAIModelMessage = !!newItem.match(/ai language model/gi)?.length;

    if (!checkRepeated && !checkAIModelMessage) {
      if (isNegativeProp) {
        const ensureNegative = await ensureNegativeChain({ text: newItem });
        if (ensureNegative) {
          console.log("\x1b[41m%s\x1b[0m", "\n Negative Property: ");
          console.log("\x1b[32m%s\x1b[0m", {
            [entity_prop_name]: ensureNegative,
          });
          thisList.push(ensureNegative);
          fs.writeFileSync(
            `${entityFolder}/${fileName}`,
            JSON.stringify(thisList, null, 2)
          );
        } else {
          console.log(
            "\x1b[31m%s\x1b[0m",
            `AI created a stupid answer on ${entity_prop_name}: ${newItem}`
          );
        }
      } else {
        console.log("\x1b[32m%s\x1b[0m", { [entity_prop_name]: newItem });
        thisList.push(newItem);
        fs.writeFileSync(
          `${entityFolder}/${fileName}`,
          JSON.stringify(thisList, null, 2)
        );
      }
    } else if (checkRepeated && !checkAIModelMessage) {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Repeated ${entity_prop_name}: ${newItem}`
      );
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        `AI created a stupid answer on ${entity_prop_name}: ${newItem}`
      );
    }

    return thisList;
  } else {
    throw new Error(`Template not found for: ${entity_prop_name}`);
  }
};
