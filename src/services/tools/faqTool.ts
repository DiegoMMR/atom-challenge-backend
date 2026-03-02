import { Genkit, z } from "genkit";
import { IFaqRepository, FaqRepository } from "../repositories/faqRepository";
import { Faq } from "../../types/faq";

export class FaqService {
  constructor(private faqRepository: IFaqRepository) {}

  private countQuestions(faqs: Faq[]): number {
    return faqs.reduce(
      (count, category) => count + category.preguntas.length,
      0,
    );
  }

  async fetchFaq(topic?: string): Promise<Faq[]> {
    const allFaqs = await this.faqRepository.getFaqs();

    if (!topic || !topic.trim()) {
      return allFaqs;
    }

    const faqs = await this.faqRepository.getFaqs(topic);

    if (!faqs || faqs.length === 0) {
      console.warn(
        `[FaqService] No se encontraron FAQs para el tema: "${topic}". Devolviendo FAQ completa como contexto.`,
      );
      return allFaqs;
    }

    const filteredQuestionCount = this.countQuestions(faqs);
    if (filteredQuestionCount < 3) {
      console.warn(
        `[FaqService] El filtro por tema "${topic}" devolvió poco contexto (${filteredQuestionCount} preguntas). Devolviendo FAQ completa.`,
      );
      return allFaqs;
    }

    return faqs;
  }
}

const faqRepo = new FaqRepository();
const faqService = new FaqService(faqRepo);

export const faqTool = (ai: Genkit) =>
  ai.defineTool(
    {
      name: "faqTool",
      description:
        "Herramienta útil para consultar las Preguntas Frecuentes (FAQ). Úsala para informar al usuario sobre horarios, precios, ubicaciones u otros datos predefinidos de la empresa.",
      inputSchema: z.object({
        topic: z
          .string()
          .optional()
          .describe(
            'Tema corto o palabra clave de la consulta (ej. "horarios", "precios", "ubicacion"). Si no se envía, devuelve la FAQ completa.',
          ),
      }),
      outputSchema: z
        .array(
          z.object({
            categoria: z.string(),
            preguntas: z.array(
              z.object({
                id: z.number(),
                pregunta: z.string(),
                respuesta: z.string(),
              }),
            ),
          }),
        )
        .describe(
          "Una lista de objetos FAQ relacionados al tema consultado, cada uno con su categoría, pregunta y respuesta.",
        ),
    },
    async ({ topic }) => {
      return await faqService.fetchFaq(topic);
    },
  );
