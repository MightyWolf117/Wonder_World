import { GameStateService } from "./GameStateService";
import { BossNode } from "../api/client";

export const BossService = {
  addBoss: (boss: Omit<BossNode, "id">) => {
    return GameStateService.updateState(state => {
      state.activeBosses.push({
        ...boss,
        id: crypto.randomUUID()
      });
    });
  },

  deleteBoss: (id: string) => {
    return GameStateService.updateState(state => {
      state.activeBosses = state.activeBosses.filter(b => b.id !== id);
    });
  },

  attackBoss: (id: string, freqType: string) => {
    return GameStateService.updateState(state => {
      const boss = state.activeBosses.find(b => b.id === id);
      if (!boss || boss.estadoFinal === "domado" || boss.estadoFinal === "terminado") return;

      if (state.poolFrecuencias[freqType] && state.poolFrecuencias[freqType] > 0) {
        state.poolFrecuencias[freqType]--;

        if (boss.tipo === "indomable") {
          if (freqType === "C" && boss.hpRupturaActual > 0) {
            boss.hpRupturaActual--;
          }
        } else if (boss.tipo === "domable") {
          if (boss.hpRupturaActual > 0 && freqType === "C") {
            boss.hpRupturaActual--;
          } else if (boss.hpRupturaActual === 0 && boss.hpEjecucionActual > 0 && freqType === "S") {
            boss.hpEjecucionActual--;
            if (boss.hpEjecucionActual === 0) {
              boss.estadoFinal = "domado";
              state.monedas++;
            }
          }
        }
      }
    });
  },

  loadAmmo: (type: string) => {
    return GameStateService.updateState(state => {
      if (state.poolFrecuencias[type] !== undefined) {
        state.poolFrecuencias[type]++;
      }
    });
  }
};
