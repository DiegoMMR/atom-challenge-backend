import { Genkit, z } from "genkit";
import {
  IVehicleRepository,
  VehicleFilters,
  VehicleRepository,
} from "../repositories/vehicleRepository";
import { Vehicle } from "../../types/vehicle";

export class VehiclesService {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async fetchVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    const vehicles = await this.vehicleRepository.getAvailableVehicles(filters);
    return vehicles;
  }
}

const vehicleRepo = new VehicleRepository();
const vehiclesService = new VehiclesService(vehicleRepo);

export const vehiclesTool = (ai: Genkit) =>
  ai.defineTool(
    {
      name: "vehiclesTool",
      description:
        "Herramienta para consultar vehículos disponibles. Puedes filtrar por marca, modelo, año, precio, segmento o tipo de transmisión.",
      inputSchema: z.object({
        marca: z
          .string()
          .optional()
          .describe('Marca del vehículo (ej. "Toyota")'),
        modelo: z
          .string()
          .optional()
          .describe('Modelo del vehículo (ej. "Corolla")'),
        anioMin: z
          .number()
          .optional()
          .describe("Año mínimo del vehículo (ej. 2015)"),
        anioMax: z
          .number()
          .optional()
          .describe("Año máximo del vehículo (ej. 2020)"),
        precioMin: z
          .number()
          .optional()
          .describe("Precio mínimo del vehículo (ej. 10000)"),
        precioMax: z
          .number()
          .optional()
          .describe("Precio máximo del vehículo (ej. 20000)"),
        segmento: z
          .string()
          .optional()
          .describe('Segmento del vehículo (ej. "SUV")'),
        transmision: z
          .string()
          .optional()
          .describe('Tipo de transmisión (ej. "Automática")'),
      }),
      outputSchema: z.array(
        z.object({
          Marca: z.string(),
          Modelo: z.string(),
          Año: z.number(),
          Kilometraje: z.number(),
          Color: z.string(),
          Descripción: z.string(),
          Puertas: z.number(),
          Segmento: z.string(),
          Precio: z.number(),
          Estado: z.string(),
          Ciudad: z.string(),
          "Tipo de combustible": z.string(),
          Motor: z.number(),
          Transmisión: z.string(),
          URL: z.string(),
          Cantidad: z.number(),
        }),
      ),
    },
    async (filters) => {
      return await vehiclesService.fetchVehicles(filters);
    },
  );
