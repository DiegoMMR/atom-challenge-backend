export type Faq = {
  categoria: string;
  preguntas: {
    id: number;
    pregunta: string;
    respuesta: string;
  }[];
};