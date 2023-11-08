import { faker } from "@faker-js/faker";
import { mockQuestions } from "./mock-data/questions";

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

type Tx = { tx: string }

const delayMs = 1000;

const txHash = () => faker.string.hexadecimal({length: 64, prefix: ''});

const txPromise: Promise<Tx> = new Promise((res, _) => {
  setTimeout(() => res({ tx: txHash() }), delayMs);
})

const voidPromise: Promise<void> = new Promise((res, _) => {
  setTimeout(() => res(), delayMs);
})

// Oracle

export const oracleCreate = txPromise;

export const oracleResolve = async (oracle: string, outcome: OutcomeResolution): Promise<Tx> => {
  console.log('');
  return txPromise;
}

export const updateOutcomeInDb = async (questionID: string, outcome: OutcomeResolution): Promise<void> => {
  return voidPromise;
}

export const oracleClose = async (oracle: string) => {
  return txPromise;
}

// Questions

export const questionCreate = async (question: Question): Promise<QuestionCreateResult> => {
  return new Promise((res, _) => {
    setTimeout(() => res({ tx: txHash(), questionID: question.questionID }), delayMs);
  })
}

export const questionDelete = async (questionID: string) => {
  return voidPromise;
}

export const removeWaitingOperations = async (questionID: string) => {
  return voidPromise;
}

export const getQuestionById = async (questionID: string): Promise<Question> => {
  return new Promise((res, _) => {
    setTimeout(() => {
      const result = mockQuestions.find(i => i.questionID === questionID);
      if (!result) {
        throw new Error("Question not found");
      }
      return res(result);
    }, delayMs);
  });
}

export const listQuestions = async (filter: 'all' | 'open' | 'completed' = 'all'): Promise<Question[]> => {
  return new Promise((res, _) => {
    setTimeout(() => {
      const result = filter === 'all' 
        ? mockQuestions
        : filter === 'open'
          ? mockQuestions.filter(i => i.outcome === 'Undefined')
          : mockQuestions.filter(i => i.outcome !== 'Undefined');

      return res(result);
    }, delayMs);
  });
}
