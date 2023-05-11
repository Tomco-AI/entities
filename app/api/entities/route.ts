import { model } from "@/config";
import { LLMChain, PromptTemplate } from "langchain";
import { NextResponse } from "next/server";
import fs from "fs";
import {
  goalTemplates,
  negativeGoalTemplates,
  negativeQuestionsToYourselfTemplates,
  negativeYouAreTemplates,
  newNegativeThoughtTemplates,
  newThoughtTemplates,
  questionsToYourselfTemplates,
  youAreTemplates,
} from "@/templates";
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

/**
 * Create new entity
 */
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json(
      {
        message: "Name is required",
      },
      { status: 400 }
    );
  }

  fs.mkdirSync(`${baseFolder}/${body.name}`, { recursive: true });

  const newQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newQuestion = (
    await newQuestionChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: "Empty",
      negative_questions_to_yourself: "Empty",
      previous_thoughts: "Empty",
      previous_negative_thoughts: "Empty",
      goal: "Empty",
      negative_goal: "Empty",
    })
  ).text;
  console.log({ newQuestion });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${questionsFileName}`,
    JSON.stringify([newQuestion], null, 2)
  );

  const newNegativeQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(
      negativeQuestionsToYourselfTemplates[0]
    ),
  });

  const newNegativeQuestion = (
    await newNegativeQuestionChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: "Empty",
      previous_thoughts: "Empty",
      previous_negative_thoughts: "Empty",
      goal: "Empty",
      negative_goal: "Empty",
    })
  ).text;

  console.log({ newNegativeQuestion });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${negativeQuestionsFileName}`,
    JSON.stringify([newNegativeQuestion], null, 2)
  );

  const newThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });

  const newThought = (
    await newThoughtChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: "Empty",
      previous_negative_thoughts: "Empty",
      goal: "Empty",
      negative_goal: "Empty",
    })
  ).text;
  console.log({ newThought });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${thoughtsFileName}`,
    JSON.stringify([newThought], null, 2)
  );

  const newNegativeThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newNegativeThoughtTemplates[0]),
  });

  const newNegativeThought = (
    await newNegativeThoughtChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: newThought,
      previous_negative_thoughts: "Empty",
      goal: "Empty",
      negative_goal: "Empty",
    })
  ).text;

  console.log({ newNegativeThought });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${negativeThoughtsFileName}`,
    JSON.stringify([newNegativeThought], null, 2)
  );

  const newGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });

  const newGoal = (
    await newGoalChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: newThought,
      previous_negative_thoughts: newNegativeThought,
      goal: "Empty",
      negative_goal: "Empty",
    })
  ).text;

  console.log({ newGoal });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${goalsFileName}`,
    JSON.stringify([newGoal], null, 2)
  );

  const newNegativeGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(negativeGoalTemplates[0]),
  });

  const newNegativeGoal = (
    await newNegativeGoalChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: newThought,
      previous_negative_thoughts: newNegativeThought,
      goal: newGoal,
      negative_goal: "Empty",
    })
  ).text;

  console.log({ newNegativeGoal });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${negativeGoalsFileName}`,
    JSON.stringify([newNegativeGoal], null, 2)
  );

  const newYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });

  const newYouAre = (
    await newYouAreChain.call({
      you_are: "Nothing",
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: newThought,
      previous_negative_thoughts: newNegativeThought,
      goal: newGoal,
      negative_goal: newNegativeGoal,
    })
  ).text;

  console.log({ newYouAre });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${youAresFileName}`,
    JSON.stringify([newYouAre], null, 2)
  );

  const newNegativeYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(negativeYouAreTemplates[0]),
  });

  const newNegativeYouAre = (
    await newNegativeYouAreChain.call({
      you_are: newYouAre,
      negative_you_are: "Nothing",
      questions_to_yourself: newQuestion,
      negative_questions_to_yourself: newNegativeQuestion,
      previous_thoughts: newThought,
      previous_negative_thoughts: newNegativeThought,
      goal: newGoal,
      negative_goal: newNegativeGoal,
    })
  ).text;

  console.log({ newNegativeYouAre });

  fs.writeFileSync(
    `${baseFolder}/${body.name}/${negativeYouAresFileName}`,
    JSON.stringify([newNegativeYouAre], null, 2)
  );

  const response = {
    message: "New entity created",
    data: {
      name: body.name,
      questions: [newQuestion],
      negativeQuestions: [newNegativeQuestion],
      thoughts: [newThought],
      negativeThoughts: [newNegativeThought],
      goals: [newGoal],
      negativeGoals: [newNegativeGoal],
      youAres: [newYouAre],
      negativeYouAres: [newNegativeYouAre],
    },
  };

  return NextResponse.json({ data: response });
}
