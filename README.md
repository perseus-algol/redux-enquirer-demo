# redux-enquirer-demo

Redux with Enquirer demo.

Bootstrap:

- https://phillcode.io/nodejs-console-app-with-typescript-linting-and-testing


## Inquirer vs Enquirer

- https://github.com/enquirer/enquirer/issues/135 (and the last comment https://github.com/enquirer/enquirer/issues/135#issuecomment-851367525)


## Draft Snippets

```ts
type QuestionsFilter = 'open' | 'completed' | 'all';

const fetchQuestions = createAsyncThunk('qwd', async (arg: QuestionsFilter) => {
  return Promise.resolve([
    1,2,3
  ]);
});

const isObject = (v: any) => typeof v === 'object' && !(v instanceof Array) && v !== null;
```