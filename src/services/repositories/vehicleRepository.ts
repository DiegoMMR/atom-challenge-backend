import { Vehicle } from "../../types/vehicle";
import { vehiclesData } from "../../data/autos";

export interface VehicleFilters {
    marca?: string;
    modelo?: string;
    anioMin?: number;
    anioMax?: number;
    precioMin?: number;
    precioMax?: number;
    segmento?: string;
    transmision?: string;
}

export interface IVehicleRepository {
    getAvailableVehicles(filters?: VehicleFilters): Promise<Vehicle[]>;
};

export class VehicleRepository implements IVehicleRepository {
    async getAvailableVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
        let results = vehiclesData;

        if (!filters) return results;

        if (filters.marca) {
            const marcaLower = filters.marca.toLowerCase();
            results = results.filter(v => v.Marca.toLowerCase() === marcaLower);
        }

        if (filters.modelo) {
            const modeloLower = filters.modelo.toLowerCase();
            results = results.filter(v => v.Modelo.toLowerCase() === modeloLower);
        }

        if (filters.anioMin !== undefined) {
            results = results.filter(v => v.Año >= filters.anioMin!);
        }

        if (filters.anioMax !== undefined) {
            results = results.filter(v => v.Año <= filters.anioMax!);
        }

        if (filters.precioMin !== undefined) {
            results = results.filter(v => v.Precio >= filters.precioMin!);
        }

        if (filters.precioMax !== undefined) {
            results = results.filter(v => v.Precio <= filters.precioMax!);
        }

        if (filters.segmento) {
            const segmentoLower = filters.segmento.toLowerCase();
            results = results.filter(v => v.Segmento.toLowerCase() === segmentoLower);
        }

        if (filters.transmision) {
            const transmisionLower = filters.transmision.toLowerCase();
            results = results.filter(v => v.Transmisión.toLowerCase() === transmisionLower);
        }

        return results;
    }
}