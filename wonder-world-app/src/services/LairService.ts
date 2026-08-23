import { GameStateService } from "./GameStateService";

export const LairService = {
  modifyLimpieza: (delta: number) => {
    return GameStateService.updateState(state => {
      state.limpieza = Math.max(0, Math.min(5, state.limpieza + delta));
    });
  },

  injectMelody: (melody: string) => {
    return GameStateService.updateState(state => {
      const validas = new Set(["S", "O", "L", "D"]);
      const mel = melody.replace(/"/g, ''); // strip quotes if any
      for (let i = 0; i < mel.length; i++) {
        if (i < mel.length - 1 && mel[i] === 'D' && mel[i+1] === 'S') {
          state.poolFrecuencias["Ds"]++;
          i++;
        } else if (validas.has(mel[i])) {
          state.poolFrecuencias[mel[i]]++;
        }
      }
    });
  },

  dissolveS: (target: string) => {
    return GameStateService.updateState(state => {
      if (state.poolFrecuencias["S"] > 0) {
        state.poolFrecuencias["S"]--;
        if (target === "O") state.poolFrecuencias["O"] += 1;
        else if (target === "L") state.poolFrecuencias["L"] += 2;
        else if (target === "Ds") state.poolFrecuencias["Ds"] += 2;
        else if (target === "D") state.poolFrecuencias["D"] += 3;
      }
    });
  },

  activateSector: (sector: string, notes: string[]) => {
    return GameStateService.updateState(state => {
      // Consumir notas
      for (const note of notes) {
        if (state.poolFrecuencias[note] > 0) {
          state.poolFrecuencias[note]--;
        }
      }

      if (sector === "V" || sector === "IX") {
        state.limpieza = Math.max(0, Math.min(5, state.limpieza + (sector === "V" ? 1 : 2)));
        state.estres = Math.max(0, state.estres - 1);
      } else if (sector === "I" || sector === "II") state.estres = Math.max(0, state.estres - 1);
      else if (sector === "III") state.mood = Math.min(10, state.mood + 1);
      else if (sector === "IV" || sector === "VI" || sector === "VII") {
        state.estres = Math.max(0, state.estres - 2);
        if (sector === "VII") state.puntosEgo = Math.min(state.maxEgo, state.puntosEgo + 1);
      }
      else if (sector === "VIII") state.mood = Math.min(10, state.mood + 2);
      else if (sector === "X") {
        state.mood = Math.min(10, state.mood + 2);
        state.estres = Math.max(0, state.estres - 1);
      }
      else if (sector === "XI") {
        state.estres = Math.max(0, state.estres - 4);
        state.mood = Math.min(10, state.mood + 2);
      }
    });
  }
};
