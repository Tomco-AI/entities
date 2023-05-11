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

/**
 * Create new entity
 */
export async function PUT(request: Request, { params }: any) {
  const name = params.name;

  const existsEntity = fs.existsSync(`entity-data/${name}`);

  if (!existsEntity) {
    return NextResponse.json(
      {
        message: "Entity not found",
      },
      { status: 404 }
    );
  }

  const entityFolder = `entity-data/${name}`;

  const questions: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/questions.json`, "utf-8")
  );
  const negativeQuestions: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/negative-questions.json`, "utf-8")
  );
  const thoughts: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/thoughts.json`, "utf-8")
  );
  const negativeThoughts: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/negative-thoughts.json`, "utf-8")
  );
  const goals: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/goals.json`, "utf-8")
  );
  const negativeGoals: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/negative-goals.json`, "utf-8")
  );
  const youAres: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/youAres.json`, "utf-8")
  );
  const negativeYouAres: string[] = JSON.parse(
    fs.readFileSync(`${entityFolder}/negative-youAres.json`, "utf-8")
  );

  const newQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newQuestion = (
    await newQuestionChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  console.log({ newQuestion });
  questions.push(newQuestion);
  fs.writeFileSync(
    `${entityFolder}/questions.json`,
    JSON.stringify(questions, null, 2)
  );

  const newNegativeQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newNegativeQuestion = (
    await newNegativeQuestionChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  console.log({ newNegativeQuestion });

  negativeQuestions.push(newNegativeQuestion);
  fs.writeFileSync(
    `${entityFolder}/negative-questions.json`,
    JSON.stringify(negativeQuestions, null, 2)
  );

  const newThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });
  const newThought = (
    await newThoughtChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  thoughts.push(newThought);
  console.log({ newThought });
  fs.writeFileSync(
    `${entityFolder}/thoughts.json`,
    JSON.stringify(thoughts, null, 2)
  );

  const newNegativeThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });

  const newNegativeThought = (
    await newNegativeThoughtChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  negativeThoughts.push(newNegativeThought);
  console.log({ newNegativeThought });
  fs.writeFileSync(
    `${entityFolder}/negative-thoughts.json`,
    JSON.stringify(negativeThoughts, null, 2)
  );

  const newGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });
  const newGoal = (
    await newGoalChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  goals.push(newGoal);
  console.log({ newGoal });
  fs.writeFileSync(
    `${entityFolder}/goals.json`,
    JSON.stringify(goals, null, 2)
  );

  const newNegativeGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });
  const newNegativeGoal = (
    await newNegativeGoalChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  negativeGoals.push(newNegativeGoal);
  console.log({ newNegativeGoal });
  fs.writeFileSync(
    `${entityFolder}/negative-goals.json`,
    JSON.stringify(negativeGoals, null, 2)
  );

  const newYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });
  const newYouAre = (
    await newYouAreChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  youAres.push(newYouAre);
  console.log({ newYouAre });
  fs.writeFileSync(
    `${entityFolder}/youAres.json`,
    JSON.stringify(youAres, null, 2)
  );

  const newNegativeYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });
  const newNegativeYouAre = (
    await newNegativeYouAreChain.call({
      you_are: youAres.join("\n"),
      negative_you_are: negativeYouAres.join("\n"),
      questions_to_yourself: questions.join("\n"),
      negative_questions_to_yourself: negativeQuestions.join("\n"),
      previous_thoughts: thoughts.join("\n"),
      previous_negative_thoughts: negativeThoughts.join("\n"),
      goal: goals.at(-1),
      negative_goal: negativeGoals.at(-1),
    })
  ).text;
  negativeYouAres.push(newNegativeYouAre);
  console.log({ newNegativeYouAre });
  fs.writeFileSync(
    `${entityFolder}/negative-youAres.json`,
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
