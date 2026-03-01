export type NodeType =
  | "memory"
  | "orchestrator"
  | "validator"
  | "specialist"
  | "generic"
  | "init"
  | "end";

export interface NodePort {
  id: string;
  schemaRef?: string;
}

export interface NodePorts {
  in: NodePort[];
  out: NodePort[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface INodeConfig {
  id: string;
  typeNode: NodeType;
  type: any;
  label?: string;
  position: NodePosition;
  ports: NodePorts;
  config?: Record<string, any>;
}

export interface FlowConfig {
  nodes: INodeConfig[];
}

export interface FlowUpdateRequest {
  id: string;
  flow: FlowConfig;
}
