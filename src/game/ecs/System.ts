import { Entity } from "./Entity";

export abstract class System {
  abstract requiredComponents: string[];
  abstract update(entities: Entity[], delta: number): void;
}

export default System;