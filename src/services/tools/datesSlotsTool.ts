import { Genkit, z } from 'genkit';
import { IDatesSlotsRepository, DatesSlotsRepository } from '../repositories/datesSlotsRepository';

export class DatesSlotsService {
    constructor(private datesSlotsRepository: IDatesSlotsRepository) {}

    async fetchSlotsByDate(fecha: string): Promise<string[]> {
        const slots = await this.datesSlotsRepository.getSlotsByDate(fecha);
        return slots;
    }
}

const datesSlotsRepo = new DatesSlotsRepository();
const datesSlotsService = new DatesSlotsService(datesSlotsRepo);

export const datesSlotsTool = (ai: Genkit) => ai.defineTool(
    {
        name: 'datesSlotsTool',
        description: `Herramienta para consultar los slots disponibles para una fecha específica. Úsala para informar al usuario sobre los horarios disponibles para reservas, citas u otros eventos en una fecha dada. La fecha de HOY es: ${new Date().toISOString().split('T')[0]}. Utiliza esta fecha actual como referencia para calcular fechas relativas (como "mañana", "la próxima semana").`,
        inputSchema: z.object({
            fecha: z.string().describe(`Fecha en formato YYYY-MM-DD (ej. "2024-07-01"). Asegúrate de usar la fecha correcta basándote en que hoy es ${new Date().toISOString().split('T')[0]}`)
        }),
        outputSchema: z.array(z.string()).describe('Un array de timestamps ISO 8601 disponibles para la fecha consultada (ej. ["2024-07-01T09:00:00Z", "2024-07-01T10:00:00Z"])'),
    },
    async ({ fecha }) => {
        return await datesSlotsService.fetchSlotsByDate(fecha);
    }
)