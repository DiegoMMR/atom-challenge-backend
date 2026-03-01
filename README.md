# Atom Challenge Backend

## Variables de entorno

Configura un archivo `.env` en la raíz del proyecto con estas variables:

```env
PORT=3000
ALLOW_ORIGIN=http://localhost:5173
GEMINI_API_KEY=tu_api_key
GEMINI_MODEL=gemini-2.5-flash
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`GEMINI_MODEL` se usa como modelo por defecto para todos los agentes (`generic`, `orchestrator`, `specialist`, `validator`).

## Ejecutar servidor

```bash
pnpm install
pnpm dev
```

Servidor por defecto: `http://localhost:3000`

## Probar runFlow con el flujo de ejemplo

Este backend ejecuta el flujo en orden:

1. Empieza en `init`
2. Ejecuta handler por `typeNode`
3. Usa la salida de cada nodo como entrada del siguiente
4. Termina en `end`

### 1) Actualizar un flow existente

El endpoint disponible para guardar cambios es `POST /flow/update`.

> Reemplaza `FLOW_ID_EXISTENTE` por un id real de la colección `flows` en Firebase.

```bash
curl -X POST http://localhost:3000/flow/update \
	-H "Content-Type: application/json" \
	-d '{
		"id": "FLOW_ID_EXISTENTE",
		"flow": {
			"nodes": [
				{
					"id": "node-init_699b9e99-abe3-43cd-bdbe-bbc862f1a5ab",
					"typeNode": "init",
					"ports": {
						"in": [],
						"out": [
							{
								"id": "node-orchestrator_e16c8a0c-8440-497b-948c-4ebe1d332d33"
							}
						],
						"memory": []
					},
					"position": {
						"x": 100,
						"y": 100
					}
				},
				{
					"id": "node-orchestrator_e16c8a0c-8440-497b-948c-4ebe1d332d33",
					"typeNode": "orchestrator",
					"ports": {
						"in": [],
						"out": [
							{
								"id": "node-specialist_250a65f3-f3de-4e16-93a8-80208b3e7b6e"
							},
							{
								"id": "node-generic_96afabbd-c6ef-4158-8e5a-20afbbc4bb31"
							}
						],
						"memory": []
					},
					"position": {
						"x": 121,
						"y": 283
					}
				},
				{
					"id": "node-specialist_250a65f3-f3de-4e16-93a8-80208b3e7b6e",
					"typeNode": "specialist",
					"ports": {
						"in": [],
						"out": [
							{
								"id": "node-end_430fa6a1-e6dc-4154-8caf-f28b72bd937b"
							}
						],
						"memory": []
					},
					"position": {
						"x": 381,
						"y": 274
					}
				},
				{
					"id": "node-generic_96afabbd-c6ef-4158-8e5a-20afbbc4bb31",
					"typeNode": "generic",
					"ports": {
						"in": [],
						"out": [
							{
								"id": "node-end_430fa6a1-e6dc-4154-8caf-f28b72bd937b"
							}
						],
						"memory": []
					},
					"position": {
						"x": 408,
						"y": 407
					}
				},
				{
					"id": "node-end_430fa6a1-e6dc-4154-8caf-f28b72bd937b",
					"typeNode": "end",
					"ports": {
						"in": [],
						"out": [],
						"memory": []
					},
					"position": {
						"x": 193,
						"y": 616
					}
				}
			]
		}
	}'
```

### 2) Ejecutar el flujo

```bash
curl -X POST http://localhost:3000/flow/run \
	-H "Content-Type: application/json" \
	-d '{
		"id": "FLOW_ID_EXISTENTE",
		"input": "Hola, quiero conocer opciones de SUV disponibles"
	}'
```

### 3) Respuesta esperada (estructura)

```json
{
  "success": true,
  "flowId": "FLOW_ID_EXISTENTE",
  "stoppedAt": "node-end_...",
  "executedNodes": [
    "node-init_...",
    "node-orchestrator_...",
    "node-specialist_...",
    "node-end_..."
  ],
  "finalOutput": "...",
  "trace": [
    {
      "nodeId": "node-init_...",
      "nodeType": "init",
      "input": "...",
      "output": "...",
      "nextNodeId": "node-orchestrator_..."
    },
    {
      "nodeId": "node-orchestrator_...",
      "nodeType": "orchestrator",
      "input": "...",
      "output": "{\"selectedAgent\":\"specialist\",...}",
      "selectedAgent": "specialist",
      "nextNodeId": "node-specialist_..."
    }
  ]
}
```

## Notas

- Si no existe `init`, si hay ciclo, o faltan nodos destino, `runFlow` falla (fail-fast).
- En nodos no-orchestrator con múltiples salidas, toma la primera en el arreglo `ports.out`.
- En `orchestrator`, la rama se selecciona comparando `selectedAgent` con `typeNode` del nodo destino.
