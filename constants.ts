import { EntityPropNamesType } from "./app/api/helpers/evolveEntityPropChain";

// Save entity data
export const baseFolder = "entity-data";

export const questionsFileName = "questions.json";
export const negativeQuestionsFileName = "negative-questions.json";

export const thoughtsFileName = "thoughts.json";
export const negativeThoughtsFileName = "negative-thoughts.json";

export const goalsFileName = "goals.json";
export const negativeGoalsFileName = "negative-goals.json";

export const youAresFileName = "youAres.json";
export const negativeYouAresFileName = "negative-youAres.json";

export const entity_props_names: EntityPropNamesType[] = [
  "questions",
  "negative_questions",
  "thoughts",
  "negative_thoughts",
  "goals",
  "negative_goals",
  "you_ares",
  "negative_you_ares",
];

export const entityPropsMaxTokens = Number(
  (3200 / entity_props_names.length).toFixed(2)
);
