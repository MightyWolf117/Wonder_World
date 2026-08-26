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
      if (!boss || boss.estadoFinal === "domado" || boss.estadoFinal === "terminado" || boss.estadoFinal === "se_acabo" || boss.estadoFinal === "escapo") return;

      if (state.poolFrecuencias[freqType] && state.poolFrecuencias[freqType] > 0) {
        state.poolFrecuencias[freqType]--;

        if (boss.tipo === "indomable") {
          // Indomables: Solo se atacan con 'C'
          if (freqType === "C") {
            if (boss.hpRupturaActual > 0) {
              boss.hpRupturaActual--;
              if (boss.hpRupturaActual === 0) {
                 boss.estadoFinal = "endless";
              }
            } else if (boss.estadoFinal === "endless") {
              // Modo endless: Ganas cazas extra
              boss.extraCazas = (boss.extraCazas || 0) + 1;
            }
          }
        } else if (boss.tipo === "domable") {
          // Domables: 'C' para ruptura, 'S' para ejecución
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
