// Generate Mock Data

import { Question } from '../src/lib';
import fs from 'node:fs';
import { faker } from "@faker-js/faker";

const categories = ['business', 'crypto', 'sports', 'politics', 'science', 'pop culture'];

const token = () => faker.string.hexadecimal({length: 56, prefix: ''});

const getImage = () => {
  const seed = faker.string.alphanumeric({length: 6});
  return `https://picsum.photos/seed/${seed}/1100/509`;
};

const genCategoriess = () => {
  const count = faker.helpers.arrayElement([1, 1, 2]);
  const cats = [...categories];
  const result: string[] = []; 
  Array.from({length: count}, () => {
    const idx = faker.number.int({min: 0, max: cats.length-1});
    result.push(cats[idx]);
    cats.splice(idx, 1);
  });
  return result;
};

function createQuestion(): Question {
  const outcome: Question["outcome"] = faker.helpers.arrayElement(['Yes', 'No', 'Undefined']);
  return {
    questionID: token(),
    question: faker.helpers.fake('Will {{person.firstName}} {{person.lastName}} {{word.verb}} {{word.noun}}?'),
    description: faker.lorem.paragraph(),
    categories: genCategoriess(),
    imageUrl: getImage(),
    dueDate: faker.date.future().valueOf(),
    outcome
  };
}

function createQuestions(): Question[] {
  return Array.from({length: 8}, createQuestion);
}

function getQuestionsTsContent (data: Question[]): string {
  const str = JSON.stringify(data, null, 2);
  return `/* Autogenerated File */
/* eslint-disable comma-dangle */
/* eslint-disable max-len */
import { Question } from "../lib";

export const mockQuestions: Question[] = ${str};
`;
}


// ======================================================================================
// === Entry Point

const questions = createQuestions();
fs.writeFileSync('src/mock-data/questions.ts', getQuestionsTsContent(questions));