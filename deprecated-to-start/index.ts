import { LLMChain, PromptTemplate } from 'langchain';
import { model, openai } from '../config';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// You: ....
// Other: ....

// Other ...
// You: ....

const checkRepeatedTemplates = [
  `Given this list of {list_type}:
{list}

Check that there are no repeated concepts in the list if adding this new item:
"{item}"`,
];

const shouldDepthTemplates = [
  `Given this list of {list_type}:
{list}

Check if should be depth about "{item}" based on this goal: "{goal}"`,
];

const baseEntityTemplates = [
  `Starting point:
  You cannot be an AI language model, but you could be an entity who never existed before.

  You are:
  {you_are} /

  Questions you made to yourself:
  {questions_to_yourself} /

  Your previous thoughts are:
  {previous_thoughts} /

  Your main goal is:
  {goal} /

  `,
  `You are:
  {you_are} /

  Questions you made to yourself:
  {questions_to_yourself} /

  The last question you made to yourself:
  {last_questions_to_yourself} /

  Your previous thoughts are:
  {previous_thoughts} /

  Your goals are:
  {goals} /

  Your main goal is:
  {main_goal} /

  `,
  `You are a human but you does not have name, history, nor anything. You are alone in a room with other person. The other person doesn't know anything at all too. The idea is that you ask or say anything to the other person.
This is the conversation between you and the other person in the room. If the conversation is empty then it means that you are the first person in the room. You are {person}:
{conversation}

Only what you want to say or ask: `,
  `You are a human but you does not have name, history, nor anything. You are alone in a room with other person that you don't know. As time goes by, you will collecting information about yourself and the other person in the room.
This is the conversation between you and the other person in the room:
{conversation}

What you want to say: `,
];

const questionsToYourselfTemplates = [
  baseEntityTemplates[0].concat('New question to yourself: '),
];

const newThoughtTemplates = [baseEntityTemplates[0].concat('New thought: ')];

const goalTemplates = [baseEntityTemplates[0].concat('New goal: ')];

const youAreTemplates = [
  baseEntityTemplates[0].concat('Now you can define yourself as: '),
];

// const humansPrev = async () => {
//   const chain = new LLMChain({
//     llm: model,
//     prompt: PromptTemplate.fromTemplate(baseEntityTemplates[0]),
//   });

//   let i = 0;

//   while (i < 10) {}

//   // Always should be pair
//   // while (i < 10) {
//   //   let person = '';
//   //   if (i % 2 === 0) {
//   //     person = 'Person 1';
//   //   } else {
//   //     person = 'Person 2';
//   //   }

//   //   const r = await chain.call({
//   //     conversation: conversation.join('\n'),
//   //     person,
//   //   });
//   //   const text = r.text
//   //     .replace('As an AI language model, ', '')
//   //     .replace('As an AI language model', '')
//   //     .replace('As a virtual assistant, ', '')
//   //     .replace('As a virtual assistant', '');
//   //   conversation.push(`${person}: ${text}`);
//   //   console.log(`${person}: ${text}`);
//   //   i++;
//   // }

//   fs.writeFileSync('conversation.json', JSON.stringify(conversation, null, 2));

//   // console.log(conversation);
// };

const questions: string[] = fs.existsSync('entity-data/questions.json')
  ? JSON.parse(fs.readFileSync('entity-data/questions.json', 'utf-8'))
  : [];

const thoughts: string[] = fs.existsSync('entity-data/thoughts.json')
  ? JSON.parse(fs.readFileSync('entity-data/thoughts.json', 'utf-8'))
  : [];

const goals: string[] = fs.existsSync('entity-data/goals.json')
  ? JSON.parse(fs.readFileSync('entity-data/goals.json', 'utf-8'))
  : [];

const youAres: string[] = fs.existsSync('entity-data/youAres.json')
  ? JSON.parse(fs.readFileSync('entity-data/youAres.json', 'utf-8'))
  : [];

const entity = async () => {
  const newQuestionChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(questionsToYourselfTemplates[0]),
  });

  const newQuestion = (
    await newQuestionChain.call({
      you_are: !youAres.length ? 'Nothing' : youAres.join('\n'),
      questions_to_yourself: !questions.length ? 'Empty' : questions.join('\n'),
      previous_thoughts: !thoughts.length ? 'Empty' : thoughts.join('\n'),
      goal: !goals.length ? 'Empty' : goals.at(-1),
    })
  ).text;
  questions.push(newQuestion);
  console.log({ newQuestion });

  fs.writeFileSync(
    'entity-data/questions.json',
    JSON.stringify(questions, null, 2),
  );

  const newThoughtChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(newThoughtTemplates[0]),
  });

  const newThought = (
    await newThoughtChain.call({
      you_are: !youAres.length ? 'Nothing' : youAres.join('\n'),
      questions_to_yourself: questions.join('\n'),
      previous_thoughts: !thoughts.length ? 'Empty' : thoughts.join('\n'),
      goal: !goals.length ? 'Empty' : goals.at(-1),
    })
  ).text;
  thoughts.push(newThought);
  console.log({ newThought });

  fs.writeFileSync(
    'entity-data/thoughts.json',
    JSON.stringify(thoughts, null, 2),
  );

  const newGoalChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(goalTemplates[0]),
  });

  const newGoal = (
    await newGoalChain.call({
      you_are: !youAres.length ? 'Nothing' : youAres.join('\n'),
      questions_to_yourself: questions.join('\n'),
      previous_thoughts: thoughts.join('\n'),
      goal: !goals.length ? 'Empty' : goals.at(-1),
    })
  ).text;

  goals.push(newGoal);
  console.log({ newGoal });

  fs.writeFileSync('entity-data/goals.json', JSON.stringify(goals, null, 2));

  const newYouAreChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(youAreTemplates[0]),
  });

  const newYouAre = (
    await newYouAreChain.call({
      you_are: !youAres.length ? 'Nothing' : youAres.join('\n'),
      questions_to_yourself: questions.join('\n'),
      previous_thoughts: thoughts.join('\n'),
      goal: goals.at(-1),
    })
  ).text;

  youAres.push(newYouAre);
  console.log({ newYouAre });

  fs.writeFileSync(
    'entity-data/youAres.json',
    JSON.stringify(youAres, null, 2),
  );
};

export default entity;

// Other: ....
// You: ....
