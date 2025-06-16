import { Component } from "../../ecs/Component";
import { AIAction } from "../../../ai/action-parser/schema";

export class AIBehaviorComponent extends Component {
  static typeName = "ai_behavior";
  
  behaviorType: "aggressive" | "neutral" | "friendly" = "neutral";
  lastAction: AIAction | null = null;
  decisionCooldown: number = 1000; 
  lastDecisionTime: number = 0;
  
  isProcessing: boolean = false;
  currentGoal: string = "";
  personalityTraits: string[] = [];
  memory: string[] = [];
  
  constructor(behaviorType?: "aggressive" | "neutral" | "friendly") {
    super();
    if (behaviorType) this.behaviorType = behaviorType;
  }

  canMakeDecision(): boolean {
    return Date.now() - this.lastDecisionTime > this.decisionCooldown;
  }

  resetCooldown(): void {
    this.lastDecisionTime = Date.now();
  }

  addMemory(event: string): void {
    this.memory.push(event);
    if (this.memory.length > 10) this.memory.shift();
  }
}