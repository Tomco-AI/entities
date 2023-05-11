import { model } from "@/config";
import { LLMChain, PromptTemplate } from "langchain";
import { NextResponse } from "next/server";
import fs from "fs";
import {
  goalTemplates,
  newThoughtTemplates,
  questionsToYourselfTemplates,
  youAreTemplates,
} from "@/templates";
import {
  baseFolder,
  questionsFileName,
  negativeGoalsFileName,
  goalsFileName,
  negativeQuestionsFileName,
  negativeThoughtsFileName,
  negativeYouAresFileName,
  thoughtsFileName,
  youAresFileName,
} from "@/constants";

/**
 * Create new entity
 */
export async function PUT(request: Request, { params }: any) {
  const name = params.name;

  const existsEntity = fs.existsSync(`${baseFolder}/${name}`);

  if (!existsEntity) {
    return NextResponse.json(
      {
        message: "Entity not found",
      },
      { status: 404 }
    );
  }

  const entityFolder = `${baseFolder}/${name}`;

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

  const generateCallArguments = () => ({
    you_are: youAres.join("\n"),
    negative_you_are: negativeYouAres.join("\n"),
    questions_to_yourself: questions.join("\n"),
    negative_questions_to_yourself: negativeQuestions.join("\n"),
    previous_thoughts: thoughts.join("\n"),
    previous_negative_thoughts: negativeThoughts.join("\n"),
    goal: goals.at(-1),
    negative_goal: negativeGoals.at(-1),
  });

  const newQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newQuestion = (await newQuestionChain.call(generateCallArguments()))
    .text;
  console.log({ newQuestion });
  questions.push(newQuestion);
  fs.writeFileSync(
    `${entityFolder}/${questionsFileName}`,
    JSON.stringify(questions, null, 2)
  );

  const newNegativeQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newNegativeQuestion = (
    await newNegativeQuestionChain.call(generateCallArguments())
  ).text;
  console.log({ newNegativeQuestion });

  negativeQuestions.push(newNegativeQuestion);
  fs.writeFileSync(
    `${entityFolder}/${negativeQuestionsFileName}`,
    JSON.stringify(negativeQuestions, null, 2)
  );

  const newThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });
  const newThought = (await newThoughtChain.call(generateCallArguments())).text;
  thoughts.push(newThought);
  console.log({ newThought });
  fs.writeFileSync(
    `${entityFolder}/${thoughtsFileName}`,
    JSON.stringify(thoughts, null, 2)
  );

  const newNegativeThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });

  const newNegativeThought = (
    await newNegativeThoughtChain.call(generateCallArguments())
  ).text;
  negativeThoughts.push(newNegativeThought);
  console.log({ newNegativeThought });
  fs.writeFileSync(
    `${entityFolder}/${negativeThoughtsFileName}`,
    JSON.stringify(negativeThoughts, null, 2)
  );

  const newGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });
  const newGoal = (await newGoalChain.call(generateCallArguments())).text;
  goals.push(newGoal);
  console.log({ newGoal });
  fs.writeFileSync(
    `${entityFolder}/${goalsFileName}`,
    JSON.stringify(goals, null, 2)
  );

  const newNegativeGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });
  const newNegativeGoal = (
    await newNegativeGoalChain.call(generateCallArguments())
  ).text;
  negativeGoals.push(newNegativeGoal);
  console.log({ newNegativeGoal });
  fs.writeFileSync(
    `${entityFolder}/${negativeGoalsFileName}`,
    JSON.stringify(negativeGoals, null, 2)
  );

  const newYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });
  const newYouAre = (await newYouAreChain.call(generateCallArguments())).text;
  youAres.push(newYouAre);
  console.log({ newYouAre });
  fs.writeFileSync(
    `${entityFolder}/${youAresFileName}`,
    JSON.stringify(youAres, null, 2)
  );

  const newNegativeYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });
  const newNegativeYouAre = (
    await newNegativeYouAreChain.call(generateCallArguments())
  ).text;
  negativeYouAres.push(newNegativeYouAre);
  console.log({ newNegativeYouAre });
  fs.writeFileSync(
    `${entityFolder}/${negativeYouAresFileName}`,
    JSON.stringify(negativeYouAres, null, 2)
  );

  const response = {
    message: `Entity ${name} updated`,
    data: {
      name,
      questions,
      negativeQuestions,
      thoughts,
      negativeThoughts,
      goals,
      negativeGoals,
      youAres,
      negativeYouAres,
    },
  };

  return NextResponse.json({ data: response });
}
