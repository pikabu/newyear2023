declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.hbs' {
  const content: (...args: any[]) => string;
  export default content;
}