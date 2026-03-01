import { datesSlotsData } from "../../data/dates";

export interface IDatesSlotsRepository {
    /**
     * Obtiene los slots disponibles para una fecha específica.
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns Un array de timestamps ISO 8601 disponibles para esa fecha
     */
    getSlotsByDate(fecha: string): Promise<string[]>;
}

export class DatesSlotsRepository implements IDatesSlotsRepository {
    async getSlotsByDate(fecha: string): Promise<string[]> {
        const dateSlot = datesSlotsData.find(ds => ds.fecha === fecha);
        return dateSlot ? dateSlot.slots : [];
    }
}