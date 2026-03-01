export interface FlowNode {
  id: string;
  type: 'memory' | 'orchestrator' | 'validator' | 'specialist' | 'generic' | 'tool';
  config: Record<string, any>;
}