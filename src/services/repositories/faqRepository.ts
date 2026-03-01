export interface IFaqRepository {
  /**
   * Obtiene la respuesta de una pregunta frecuente relacionada a un tema clave.
   */
  getAnswer(topic: string): Promise<string | null>;
}

export class FirebaseFaqRepository implements IFaqRepository {
  // Ej: constructor(private db: ReturnType<typeof getFirestore>) {}

  async getAnswer(topic: string): Promise<string | null> {
    console.log(`[FirebaseFaqRepository] Obteniendo FAQ para '${topic}' desde Firebase...`);
    
    // Aquí iría tu lógica real de Firebase, por ejemplo:
    // const docRef = this.db.collection('faqs').doc(topic);
    // const snapshot = await docRef.get();
    // if (!snapshot.exists) return null;
    // return snapshot.data()?.answer;

    // --- MOCK DE DATOS PARA EJEMPLO ---
    const mockFirebaseCollection: Record<string, string> = {
      "horarios": "Nuestro horario de atención es de Lunes a Viernes de 9:00 AM a 6:00 PM.",
      "precios": "Nuestros planes empiezan desde los $9.99 mensuales.",
      "ubicacion": "Nos encontramos en el centro de la ciudad, en la Avenida Principal 123."
    };

    return mockFirebaseCollection[topic.toLowerCase()] || null;
  }
}