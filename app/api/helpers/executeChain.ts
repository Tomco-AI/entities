import { model } from "@/config";
import {
  baseFolder,
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
} from "@/templates";
import fs from "fs";
import { LLMChain, PromptTemplate } from "langchain";
import { generateCallArguments } from "./generateCallArguments";
import { checkRepeatedChain } from "./checkRepeatedChain";

export type ListTypes =
  | "questions"
  | "negative_questions"
  | "thoughts"
  | "negative_thoughts"
  | "goals"
  | "negative_goals"
  | "you_ares"
  | "negative_you_ares";

interface Types {
  list_type: ListTypes;
  entity_name: string;
}

const getCallArgKey = (list_type: ListTypes) => {
  switch (list_type) {
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

const getFileName = (list_type: ListTypes) => {
  switch (list_type) {
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

const getTemplate = (list_type: ListTypes) => {
  switch (list_type) {
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

export const executeChain = async ({ list_type, entity_name }: Types) => {
  const callArguments = generateCallArguments(entity_name);
  const entityFolder = `${baseFolder}/${entity_name}`;
  const callArgKey = getCallArgKey(list_type);
  const fileName = getFileName(list_type);

  if (getTemplate(list_type)) {
    const template = PromptTemplate.fromTemplate(
      getTemplate(list_type) as string
    );

    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });
    const newItem = (await chain.call(callArguments.callArgs)).text;
    const thisList = callArguments.lists[callArgKey];

    console.log({ [list_type]: newItem });

    const checkRepeated = await checkRepeatedChain({
      list_type: "questions",
      list: thisList,
      item: newItem,
    });

    if (!checkRepeated) {
      thisList.push(newItem);
      fs.writeFileSync(
        `${entityFolder}/${fileName}`,
        JSON.stringify(thisList, null, 2)
      );
    } else {
      console.log(`Repeated ${list_type}: ${newItem}`);
    }

    return thisList;
  } else {
    throw new Error(`Template not found for: ${list_type}`);
  }
};
