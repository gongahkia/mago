import { JSONSchemaType } from "ajv";

export interface AIAction {
  intent: 'attack' | 'explore' | 'trade' | 'flee';
  target?: string;
  dialog?: string;
  intensity?: number;
}

export const aiActionSchema: JSONSchemaType<AIAction> = {
  type: "object",
  properties: {
    intent: { 
      type: "string", 
      enum: ["attack", "explore", "trade", "flee"],
      description: "Core behavioral intent"
    },
    target: { 
      type: "string", 
      nullable: true,
      pattern: "^[a-zA-Z0-9\\s]+$",
      maxLength: 20
    },
    dialog: {
      type: "string",
      nullable: true,
      maxLength: 140  
    },
    intensity: {
      type: "number",
      nullable: true,
      minimum: 0,
      maximum: 10
    }
  },
  required: ["intent"],
  additionalProperties: false,
  errorMessage: {
    properties: {
      intent: "Invalid action intent. Valid options: attack, explore, trade, flee",
      target: "Target must be alphanumeric with spaces (max 20 chars)",
      dialog: "Dialog cannot exceed 140 characters"
    }
  }
};