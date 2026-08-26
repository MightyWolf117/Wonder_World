import { GameStateService } from "./GameStateService";
import { RoutineNode, RoutinePenalties } from "../api/client";
import { StorageService } from "./StorageService";

const ROUTINES_KEY = "wonder_world_routines";

const getDefaultRoutines = (): RoutineNode[] => [
  { 
    id: "r1", nombre: "Minoxidil", desc: "Asegurar folículo matutino", tipo: "diaria", 
    castigo: { energia:0, estres:0, mood:0, ego:-1, monedas:0 }, escudoActivo: false, reincidenciaCount: 0, completada: false 
  },
  { 
    id: "r2", nombre: "Bañarse", desc: "Higiene personal profunda", tipo: "nodiaria", freqType: "semanal", days: [1, 3, 6], 
    castigo: { energia:0, estres:0, mood:-1, ego:0, monedas:0 }, escudoActivo: false, reincidenciaCount: 0, completada: false 
  }
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

  saveAll: (routines: RoutineNode[]) => {
    StorageService.save(ROUTINES_KEY, routines);
  },

  evaluarHabitActivoFecha: (r: RoutineNode, fechaObj: Date): boolean => {
    if (r.tipo === 'diaria') return true;
    const type = (r.freqType || 'semanal').toLowerCase();
    const dSemana = fechaObj.getDay();
    const dMes = fechaObj.getDate();

    if (type === 'semanal') return !!(r.days && r.days.includes(dSemana));
    if (type === 'mensual') return dMes === (r.param || 1);
    if (type === 'interdiario') {
      const diff = Math.floor(fechaObj.getTime() / (1000 * 60 * 60 * 24));
      return diff % 2 === 0;
    }
    return false;
  },

  getToday: () => {
    const all = RoutineService.getAll();
    const hoy = new Date();
    
    // Activas hoy y no completadas
    const active = all.filter(r => RoutineService.evaluarHabitActivoFecha(r, hoy) && !r.completada);
    // Completadas hoy
    const completed = all.filter(r => r.completada).map(r => r.id);
    
    // Deudas: Rutinas con reincidencia > 0 (simplificación visual)
    const deudas = all.filter(r => r.reincidenciaCount > 0 && !active.includes(r));
    
    // Fuera de horario (Para forjar escudos)
    const fueraDeHorario = all.filter(r => r.tipo === 'nodiaria' && !RoutineService.evaluarHabitActivoFecha(r, hoy) && !r.escudoActivo);

    return { active, completed, deudas, fueraDeHorario };
  },
  
  getEstimation: (): RoutinePenalties => {
    return { energia: 0, estres: 0, ego: 0, mood: 0, monedas: 0 };
  },

  addRoutine: (routine: RoutineNode) => {
    const all = RoutineService.getAll();
    all.push(routine);
    RoutineService.saveAll(all);
    return GameStateService.getState();
  },

  updateRoutine: (id: string, updates: Partial<RoutineNode>) => {
    const all = RoutineService.getAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      RoutineService.saveAll(all);
    }
    return GameStateService.getState();
  },

  deleteRoutine: (id: string) => {
    let all = RoutineService.getAll();
    all = all.filter(r => r.id !== id);
    RoutineService.saveAll(all);
    return GameStateService.getState();
  },

  complete: (id: string) => {
    const all = RoutineService.getAll();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0) {
      all[index].completada = true;
      all[index].reincidenciaCount = 0; // Se limpia la reincidencia
      RoutineService.saveAll(all);
    }
    return GameStateService.getState();
  },

  skip: (id: string) => {
    const all = RoutineService.getAll();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0) {
      all[index].completada = true; 
      RoutineService.saveAll(all);
    }
    return GameStateService.getState();
  },

  fail: (id: string) => {
    return GameStateService.getState(); 
  },

  forgeShield: (id: string) => {
    const all = RoutineService.getAll();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0 && !all[index].escudoActivo) {
      all[index].escudoActivo = true;
      RoutineService.saveAll(all);
      
      return GameStateService.updateState(state => {
         state.energia = Math.max(0, state.energia - 1);
      });
    }
    return GameStateService.getState();
  },

  triage: () => {
    return GameStateService.getState();
  },

  resetForNewDay: () => {
    const all = RoutineService.getAll();
    all.forEach(r => {
      r.completada = false;
    });
    StorageService.save(ROUTINES_KEY, all);
  }
};
