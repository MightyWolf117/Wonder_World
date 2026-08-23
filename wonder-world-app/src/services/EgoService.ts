import { GameStateService } from "./GameStateService";
import { StorageService } from "./StorageService";
import { EgoNode } from "../api/client";

const EGOS_KEY = "wonder_world_egos";

export const EgoService = {
  getNodes: (): EgoNode[] => {
    const saved = StorageService.load<EgoNode[]>(EGOS_KEY);
    return saved || [];
  },
  
  activateNode: (id: string) => {
    const all = EgoService.getNodes();
    const node = all.find(e => e.id === id);
    if (node && node.cooldownActual === 0) {
      node.cooldownActual = node.cooldownMax;
      StorageService.save(EGOS_KEY, all);
      
      return GameStateService.updateState(state => {
        state.estres = Math.max(0, state.estres - 1);
        // ... apply node specific buffs if needed
      });
    }
    return GameStateService.getState();
  },

  processMelody: (melody: string): EgoNode[] => {
    // Reduce cooldowns for all EGOs (combustión)
    const all = EgoService.getNodes();
    let reduction = Math.floor(melody.length / 2); // basic logic
    if (reduction === 0) reduction = 1;
    
    all.forEach(node => {
      if (node.cooldownActual > 0) {
        node.cooldownActual = Math.max(0, node.cooldownActual - reduction);
      }
    });
    StorageService.save(EGOS_KEY, all);
    
    // Impact GameState based on melody if needed
    GameStateService.updateState(state => {
       state.mood = Math.min(10, state.mood + 1);
    });
    
    return all;
  },

  addEgo: (ego: EgoNode) => {
    const all = EgoService.getNodes();
    all.push(ego);
    StorageService.save(EGOS_KEY, all);
    
    return GameStateService.updateState(state => {
      state.puntosEgo = Math.max(0, state.puntosEgo - 1); // Cost of adding ego? Mocking it.
    });
  },

  reduceCooldowns: () => {
    const all = EgoService.getNodes();
    all.forEach(node => {
      if (node.cooldownActual > 0) node.cooldownActual--;
    });
    StorageService.save(EGOS_KEY, all);
  }
};
