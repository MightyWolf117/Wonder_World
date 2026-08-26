import { GameStateService } from "../services/GameStateService";
import { RoutineService } from "../services/RoutineService";
import { StoreService } from "../services/StoreService";
import { BossService } from "../services/BossService";
import { LairService } from "../services/LairService";
import { EgoService } from "../services/EgoService";
import { StorageService } from "../services/StorageService";

export interface GameState {
  energia: number;
  maxEnergia: number;
  estres: number;
  puntosEgo: number;
  maxEgo: number;
  nivelEgo: number;
  mood: number;
  monedas: number;
  monedasIrrompibles: number;
  
  // Perfil Militar
  tituloJugador: string;
  avatarB64: string;
  consejoBatallonActual: string;
  
  afinidadMatrix: string;
  sincronizacion: number;
  corrupcion: number;
  eventos: number;
  rompeLimites: number;
  inestabilidad: number;
  triage: string; // "ESTABLE" o "ROJO"
  limpieza: number;
  impuestoDescomposicionPendiente: boolean;
  
  poolFrecuencias: { [key: string]: number }; // S, O, L, Ds, D
  activeBosses: BossNode[];
  
  // Deltas acumulados
  deltasAcumulados: RoutinePenalties;
  // Pendientes rapidos
  pendientesRapidos: PendienteRapido[];
}

export interface PendienteRapido {
  id: string;
  txt: string;
}

export interface BossNode {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string; // "domable" o "indomable"
  limiteDias: number;
  diasActivos: number;
  hpRupturaMax: number;
  hpRupturaActual: number;
  hpEjecucionMax: number;
  hpEjecucionActual: number;
  restriccion: string;
  statCastigo: string; // energia, estres, mood, ego
  valorCastigo: number;
  estadoFinal: string; // caza, terminado, domado, enrage, escapo, se_acabo, endless
  extraCazas: number; // para indomables en endless
}

export interface EgoNode {
  id: string;
  nombreNormal: string;
  nombreCorroido: string;
  descNormal: string;
  descCorroida: string;
  imagenNormalB64?: string;
  imagenCorroidaB64?: string;
  cooldownMax: number;
  cooldownActual: number;
  afinidad: string;
}

export interface RoutineNode {
  id: string;
  nombre: string;
  desc?: string;
  tipo: string; // "diaria", "nodiaria"
  freqType?: string; // "semanal", "mensual", "interdiario"
  days?: number[]; // [0,1,2,3,4,5,6]
  param?: number; // día del mes
  castigo: RoutinePenalties;
  escudoActivo: boolean;
  reincidenciaCount: number;
  completada: boolean;
}

export interface RoutinePenalties {
  energia: number;
  estres: number;
  ego: number;
  mood: number;
  monedas: number;
}

export interface StoreCatalog {
  items: any[];
  platoons: any[];
  secretItems: any[];
}

export const StateAPI = {
  getInitialState: async (): Promise<GameState> => Promise.resolve(GameStateService.getState()),
  resetState: async (): Promise<GameState> => Promise.resolve(GameStateService.reset()),
  pasarDia: async (): Promise<GameState> => {
    // Calcular castigos de rutina antes de cambiar el día
    const allRoutines = RoutineService.getAll();
    const hoy = new Date();
    
    let totalEnergia = 0, totalEstres = 0, totalMood = 0, totalEgo = 0;
    
    let perfecto = true;

    allRoutines.forEach(r => {
      if (RoutineService.evaluarHabitActivoFecha(r, hoy)) {
        if (r.completada) {
           r.reincidenciaCount = 0; // Se cumplió
        } else {
           perfecto = false;
           // Falló hoy
           if (r.escudoActivo) {
             r.escudoActivo = false; // Se consume el escudo y no pasa nada
           } else {
             r.reincidenciaCount++;
             if ((r.tipo === 'diaria' && r.reincidenciaCount >= 2) || (r.tipo === 'nodiaria' && r.reincidenciaCount >= 2)) {
               totalEnergia += r.castigo?.energia || 0;
               totalEstres += r.castigo?.estres || 0;
               totalMood += r.castigo?.mood || 0;
               totalEgo += r.castigo?.ego || 0;
             }
           }
        }
      }
    });

    RoutineService.saveAll(allRoutines);
    
    let s = GameStateService.updateState(state => {
      // Aplicar castigos
      state.energia = Math.min(state.maxEnergia, state.energia + 4 + totalEnergia);
      state.estres = Math.max(0, state.estres + totalEstres + 1); // +1 base daily
      state.mood = Math.max(0, Math.min(10, state.mood + totalMood));
      state.puntosEgo = Math.max(0, state.puntosEgo + totalEgo);
      
      // Registrar en el historial de deltas
      state.deltasAcumulados.energia = totalEnergia;
      state.deltasAcumulados.estres = totalEstres;
      state.deltasAcumulados.mood = totalMood;
      state.deltasAcumulados.ego = totalEgo;

      if (perfecto && allRoutines.filter(r => RoutineService.evaluarHabitActivoFecha(r, hoy)).length > 0) {
         state.monedas += 1;
         state.deltasAcumulados.monedas = 1;
      } else {
         state.deltasAcumulados.monedas = 0;
      }

      // Limpieza y Lair
      if (state.limpieza > 0) {
        state.limpieza--;
        if (state.limpieza === 0) {
          state.impuestoDescomposicionPendiente = true;
        }
      } else {
        state.impuestoDescomposicionPendiente = true; // Sigue en 0
      }
      
      state.poolFrecuencias = {}; // Reset pool

      // Bosses
      state.activeBosses.forEach(b => {
        if (b.estadoFinal === "caza" || b.estadoFinal === "enrage" || b.estadoFinal === "endless" || b.estadoFinal === "terminado") {
          b.diasActivos++; // Esto actúa como decremento del tiempo límite
          const diasRestantes = b.limiteDias - b.diasActivos;
          if (diasRestantes <= 0) {
            if (b.tipo === "indomable") {
               b.estadoFinal = "se_acabo";
            } else {
               if (b.hpRupturaActual > 0) b.estadoFinal = "enrage";
               else b.estadoFinal = "escapo";
            }
          }

          if (b.estadoFinal === "enrage") {
            if (b.statCastigo === "energia") state.energia = Math.max(0, state.energia - b.valorCastigo);
            else if (b.statCastigo === "estres") state.estres += b.valorCastigo;
            else if (b.statCastigo === "mood") state.mood = Math.max(0, state.mood - b.valorCastigo);
            else if (b.statCastigo === "ego") state.puntosEgo = Math.max(0, state.puntosEgo - b.valorCastigo);
          }
        }
      });
      
      state.energia = Math.max(0, state.energia);
      state.estres = Math.max(0, state.estres);
    });

    RoutineService.resetForNewDay();
    // EgoService.reduceCooldowns(); (Omitido por ahora si se usa Cámara de Combustión, pero si es diario se puede dejar)
    return Promise.resolve(s);
  },
  resetDay: async (): Promise<GameState> => Promise.resolve(GameStateService.getState()),
  undo: async (): Promise<GameState> => Promise.resolve(GameStateService.getState()),
  descansoTotal: async (): Promise<GameState> => {
    return Promise.resolve(GameStateService.updateState(state => {
      state.energia = state.maxEnergia;
    }));
  },
  importState: async (data: any): Promise<GameState> => {
    StorageService.save("wonder_world_state", data);
    return Promise.resolve(data as GameState);
  }
};

export const RoutineAPI = {
  getToday: async (): Promise<{active: RoutineNode[], completed: string[]}> => Promise.resolve(RoutineService.getToday()),
  getEstimation: async (): Promise<RoutinePenalties> => Promise.resolve(RoutineService.getEstimation()),
  logRoutine: async (_tipo: string, _diff: number): Promise<GameState> => Promise.resolve(RoutineService.complete("x")),
  complete: async (id: string): Promise<GameState> => Promise.resolve(RoutineService.complete(id)),
  skip: async (id: string): Promise<GameState> => Promise.resolve(RoutineService.skip(id)),
  triage: async (): Promise<GameState> => Promise.resolve(RoutineService.triage())
};

export const StoreAPI = {
  getCatalog: async (): Promise<StoreCatalog> => Promise.resolve(StoreService.getCatalog()),
  trade: async (type: string, amount: number = 1): Promise<GameState> => Promise.resolve(StoreService.trade(type, amount)),
  buyItem: async (type: string, amount: number): Promise<GameState> => Promise.resolve(StoreService.buyItem(type, amount)),
  buySecretItem: async (id: string): Promise<GameState> => Promise.resolve(StoreService.buySecret(id)),
  buyPlatoon: async (id: string): Promise<GameState> => Promise.resolve(StoreService.buyPlatoon(id))
};

export const BossAPI = {
  addBoss: async (boss: Omit<BossNode, "id">): Promise<GameState> => Promise.resolve(BossService.addBoss(boss)),
  deleteBoss: async (id: string): Promise<GameState> => Promise.resolve(BossService.deleteBoss(id)),
  attackBoss: async (id: string, freqType: string): Promise<GameState> => Promise.resolve(BossService.attackBoss(id, freqType)),
  loadAmmo: async (type: string): Promise<GameState> => Promise.resolve(BossService.loadAmmo(type))
};

export const LairAPI = {
  modifyLimpieza: async (delta: number): Promise<GameState> => Promise.resolve(LairService.modifyLimpieza(delta)),
  injectMelody: async (melody: string): Promise<GameState> => Promise.resolve(LairService.injectMelody(melody)),
  dissolveS: async (target: string): Promise<GameState> => Promise.resolve(LairService.dissolveS(target)),
  activateSector: async (sector: string, notes: string[]): Promise<GameState> => Promise.resolve(LairService.activateSector(sector, notes))
};

export const EgoAPI = {
  getAll: async (): Promise<EgoNode[]> => Promise.resolve(EgoService.getNodes() as any),
  activate: async (id: string): Promise<GameState> => Promise.resolve(EgoService.activateNode(id)),
  processMelody: async (melody: string): Promise<EgoNode[]> => Promise.resolve(EgoService.processMelody(melody) as any),
  addEgo: async (ego: any): Promise<GameState> => Promise.resolve(EgoService.addEgo(ego))
};
