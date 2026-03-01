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
  memory?: NodePort[];
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

export type FlowConfig = INodeConfig[];

export interface FlowUpdateRequest {
  id: string;
  flow: FlowConfig;
}

export interface FlowRunRequest {
  id: string;
  input: string;
}

export interface FlowExecutionStep {
  nodeId: string;
  nodeType: NodeType;
  input: string;
  output?: string;
  selectedAgent?: string;
  nextNodeId?: string;
}

export interface FlowRunResponse {
  success: boolean;
  flowId: string;
  stoppedAt: string;
  executedNodes: string[];
  finalOutput: string;
  trace: FlowExecutionStep[];
}
