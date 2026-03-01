import { genkit, z } from 'genkit';
import { IFaqRepository, FirebaseFaqRepository } from '../repositories/faqRepository';


export class FaqService {
  constructor(private faqRepository: IFaqRepository) {}

  async fetchFaq(topic: string): Promise<string> {
    const answer = await this.faqRepository.getAnswer(topic);
    
    if (!answer) {
      return `Lo siento, no encontré información en nuestra base de conocimientos para el tema: "${topic}".`;
    }

    return answer;
  }
}


const ai = genkit({}); 

const firebaseFaqRepo = new FirebaseFaqRepository();
const faqService = new FaqService(firebaseFaqRepo);

export const faqTool = ai.defineTool(
  {
    name: 'faqTool',
    description: 'Herramienta útil para consultar las Preguntas Frecuentes (FAQ). Úsala para informar al usuario sobre horarios, precios, ubicaciones u otros datos predefinidos de la empresa.',
    inputSchema: z.object({
      topic: z.string().describe('El tema corto o palabra clave de la consulta recibida (ej. "horarios", "precios", "ubicacion").')
    }),
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    // Delegamos la ejecución lógica al servicio que hemos construido
    return await faqService.fetchFaq(topic);
  }
);
