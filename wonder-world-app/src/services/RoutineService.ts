import { GameStateService } from "./GameStateService";
import { RoutineNode, RoutinePenalties } from "../api/client";
import { StorageService } from "./StorageService";

const ROUTINES_KEY = "wonder_world_routines";

const getDefaultRoutines = (): RoutineNode[] => [
  { id: "r1", nombre: "Leer 10 Páginas", tipo: "mental", limite: 5, dificultad: 2, completada: false },
  { id: "r2", nombre: "Ejercicio 30 min", tipo: "fisico", limite: 4, dificultad: 3, completada: false },
  { id: "r3", nombre: "Llamar a familia", tipo: "social", limite: 2, dificultad: 1, completada: false }
];

export const RoutineService = {
  getAll: (): RoutineNode[] => {
    const saved = StorageService.load<RoutineNode[]>(ROUTINES_KEY);
    if (!saved || saved.length === 0) {
      StorageService.save(ROUTINES_KEY, getDefaultRoutines());
      return getDefaultRoutines();
    }
    return saved;
  },

  getToday: () => {
    const all = RoutineService.getAll();
    return {
      active: all.filter(r => !r.completada),
      completed: all.filter(r => r.completada).map(r => r.id)
    };
  },
  
  getEstimation: (): RoutinePenalties => {
    const all = RoutineService.getAll();
    const active = all.filter(r => !r.completada);
    
    let penEnergia = 0;
    let penEstres = 0;
    let penEgo = 0;
    let penMood = 0;

    active.forEach(r => {
      penEnergia -= r.dificultad;
      penEstres += 1;
      if (r.tipo === "mental") penMood -= 1;
      if (r.tipo === "social") penEgo -= 1;
    });

    return {
      energia: penEnergia, 
      estres: penEstres, 
      ego: penEgo, 
      mood: penMood,
      limiteMentalRoto: false, limiteFisicoRoto: false, limiteSocialRoto: false
    };
  },

  complete: (id: string) => {
    const all = RoutineService.getAll();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0) {
      all[index].completada = true;
      StorageService.save(ROUTINES_KEY, all);
      
      return GameStateService.updateState(state => {
        const difficulty = all[index].dificultad;
        state.energia = Math.max(0, state.energia - difficulty);
        state.puntosEgo += 1;
        state.eventos++;
      });
    }
    return GameStateService.getState();
  },

  skip: (id: string) => {
    const all = RoutineService.getAll();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0) {
      all[index].completada = true; // Skipped for today
      StorageService.save(ROUTINES_KEY, all);
      
      return GameStateService.updateState(state => {
        state.estres += 1;
        state.eventos++;
      });
    }
    return GameStateService.getState();
  },

  triage: () => {
    return GameStateService.updateState(state => {
      if (state.estres > 0) {
        state.estres = Math.max(0, state.estres - 2);
        state.triage = "estable";
      } else {
        state.triage = "innecesario";
      }
    });
  },

  resetForNewDay: () => {
    const all = RoutineService.getAll();
    all.forEach(r => r.completada = false);
    StorageService.save(ROUTINES_KEY, all);
  }
};
