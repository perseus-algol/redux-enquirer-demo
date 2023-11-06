import { faker } from "@faker-js/faker";

export type Question = {
  questionID: string,
  question: string,
  description: string,
  categories: string[],
  imageUrl: string,
  dueDate: number,
  outcome: "Yes" | "No" | "Undefined",
}

export type OutcomeResolution = "Yes" | "No";

export type QuestionCreateResult = {
  tx: string,
  questionID: string,
}

export type Tx = { tx: string }

const delayMs = 1000;

const txHash = () => faker.string.hexadecimal({length: 64, prefix: ''});

export const createTxPromise = (): Promise<Tx> => new Promise((res, _) => {
  setTimeout(() => res({ tx: txHash() }), delayMs);
})

export const createVoidPromise = (): Promise<void> => new Promise((res, _) => {
  setTimeout(() => res(), delayMs);
})

// export const oracleCreate = async (): Promise<Tx> => {
//   return createTxPromise();
// }

// export const oracleResolve = async (oracle: string, outcome: OutcomeResolution): Promise<Tx> => {
//   return createTxPromise();
// }

// export const updateOutcomeInDb = async (questionID: string, outcome: OutcomeResolution): Promise<void> => {
//   return createVoidPromise();
// }

// export const questionCreate = async (question: Question): Promise<QuestionCreateResult> => {
//   return new Promise((res, _) => {
//     setTimeout(() => res({ tx: txHash(), questionID: question.questionID }), delayMs);
//   })
// }
