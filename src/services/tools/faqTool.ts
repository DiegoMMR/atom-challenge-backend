import { Genkit, z } from 'genkit';
import { IFaqRepository, FaqRepository } from '../repositories/faqRepository';
import { Faq } from '../../types/faq';

export class FaqService {
  constructor(private faqRepository: IFaqRepository) {}

  async fetchFaq(topic?: string): Promise<Faq[]> {
    const faqs = await this.faqRepository.getFaqs(topic);
    
    if (!faqs || faqs.length === 0) {
      console.warn(`[FaqService] No se encontraron FAQs para el tema: "${topic || 'general'}".`);
      return [];
    }

    return faqs;
  }
}

const faqRepo = new FaqRepository();
const faqService = new FaqService(faqRepo);

export const faqTool = (ai: Genkit) => ai.defineTool(
  {
    name: 'faqTool',
    description: 'Herramienta útil para consultar las Preguntas Frecuentes (FAQ). Úsala para informar al usuario sobre horarios, precios, ubicaciones u otros datos predefinidos de la empresa.',
    inputSchema: z.object({
      topic: z.string().describe('El tema corto o palabra clave de la consulta recibida (ej. "horarios", "precios", "ubicacion").')
    }),
    outputSchema: z.array(z.object({
      categoria: z.string(),
      preguntas: z.array(z.object({
        id: z.number(),
        pregunta: z.string(),
        respuesta: z.string()
      }))
    })).describe('Una lista de objetos FAQ relacionados al tema consultado, cada uno con su categoría, pregunta y respuesta.'),
  },
  async ({ topic }) => {
    return await faqService.fetchFaq(topic);
  }
);
