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
import fs from "fs";

export const generateCallArguments = (entity_name: string) => {
  const entityFolder = `${baseFolder}/${entity_name}`;

  const questions: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${questionsFileName}`, "utf-8")
  );
  const negativeQuestions: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${negativeQuestionsFileName}`, "utf-8")
  );
  const thoughts: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${thoughtsFileName}`, "utf-8")
  );
  const negativeThoughts: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${negativeThoughtsFileName}`, "utf-8")
  );
  const goals: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${goalsFileName}`, "utf-8")
  );
  const negativeGoals: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${negativeGoalsFileName}`, "utf-8")
  );
  const youAres: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${youAresFileName}`, "utf-8")
  );
  const negativeYouAres: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/${negativeYouAresFileName}`, "utf-8")
  );

  return {
    callArgs: {
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    },
    lists: {
      you_are: youAres,
      negative_you_are: negativeYouAres,
      questions_to_yourself: questions,
      negative_questions_to_yourself: negativeQuestions,
      previous_thoughts: thoughts,
      previous_negative_thoughts: negativeThoughts,
      goal: goals,
      negative_goal: negativeGoals,
    },
  };
};
