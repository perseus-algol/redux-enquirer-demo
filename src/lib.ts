export type Question = {
  questionID: string,
  question: string,
  description: string,
  categories: string[],
  imageUrl: string,
  dueDate: number,
  outcome: "Yes" | "No" | "Undefined",
}



const createOracle = () => {
  
}