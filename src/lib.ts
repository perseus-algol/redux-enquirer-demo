import { faker } from "@faker-js/faker";
import { mockQuestions } from "./mock-data/questions";

export type QuestionNew = {
  question: string,
  description: string,
  categories: string[],
  imageUrl: string,
  dueDate: number,
}

export type Question = QuestionNew & {
  questionID: string,
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

const txPromise = (): Promise<Tx> => new Promise((res, _) => {
  setTimeout(() => res({ tx: txHash() }), delayMs);
})

const voidPromise = (): Promise<void> => new Promise((res, _) => {
  setTimeout(() => res(), delayMs);
})

// Oracle

export const oracleCreate = async (): Promise<Tx> => {
  console.log('oracleCreate...');
  return txPromise();
};

export const oracleResolve = async (oracle: string, outcome: OutcomeResolution): Promise<Tx> => {
  console.log('oracleResolve...', oracle, outcome);
  return txPromise();
}

export const updateOutcomeInDb = async (questionID: string, outcome: OutcomeResolution): Promise<void> => {
  console.log('updateOutcomeInDb...', questionID, outcome);
  return voidPromise();
}

export const oracleClose = async (oracle: string) => {
  console.log('oracleClose...', oracle);
  return txPromise();
}

// Questions

export const questionCreate = async (question: QuestionNew): Promise<QuestionCreateResult> => {
  console.log('questionCreate...', question);
  return new Promise((res, _) => {
    setTimeout(() => {
      const i = faker.number.int({min: 0, max: mockQuestions.length-1});
      const q = mockQuestions[i];
      res({ tx: txHash(), questionID: q.questionID });
    }, delayMs);
  })
}

export const questionDelete = async (questionID: string) => {
  console.log('questionDelete...', questionID);
  return voidPromise();
}

export const removeWaitingOperations = async (questionID: string) => {
  console.log('removeWaitingOperations...', questionID);
  return voidPromise();
}

export const getQuestionById = async (questionID: string): Promise<Question> => {
  console.log('getQuestionById...', questionID);
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
  console.log('listQuestions...', filter);
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
