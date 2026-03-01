import { faqData } from "../../data/faq";
import { Faq } from "../../types/faq";

export interface IFaqRepository {
  /**
   * Obtiene las preguntas frecuentes basadas en un tema opcional.
   */
  getFaqs(topic?: string): Promise<Faq[]>;
}

export class FaqRepository implements IFaqRepository {
  // Ej: constructor(private db: ReturnType<typeof getFirestore>) {}

  async getFaqs(topic?: string): Promise<Faq[]> {
    console.log(`[FaqRepository] Obteniendo FAQ...`);

    if (!topic) {
      return faqData;
    }

    const keyword = topic.toLowerCase();
    
    const filteredFaqs = faqData.map(category => {
      if (category.categoria.toLowerCase().includes(keyword)) {
        return category; // Si coincide con la categoría entera, devolvemos todo
      }
      
      const filteredQuestions = category.preguntas.filter(q => 
        q.pregunta.toLowerCase().includes(keyword) || 
        q.respuesta.toLowerCase().includes(keyword)
      );

      return {
        ...category,
        preguntas: filteredQuestions
      };
    }).filter(category => category.preguntas.length > 0); // Removemos categorías vacías tras el filtro

    return filteredFaqs;
  }
}