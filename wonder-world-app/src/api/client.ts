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
  rangoActual: string;
  afinidadMatrix: string;
  sincronizacion: number;
  corrupcion: number;
  eventos: number;
  rompeLimites: number;
  inestabilidad: number;
  triage: string;
  limpieza: number;
  poolFrecuencias: { [key: string]: number };
  activeBosses: BossNode[];
}

export interface BossNode {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  limiteDias: number;
  diasActivos: number;
  hpRupturaMax: number;
  hpRupturaActual: number;
  hpEjecucionMax: number;
  hpEjecucionActual: number;
  restriccion: string;
  statCastigo: string;
  valorCastigo: number;
  estadoFinal: string;
}

export interface EgoNode {
  id: string;
  nombreNormal: string;
  nombreCorroido: string;
  descNormal: string;
  descCorroida: string;
  descripcion?: string;
  imagenBase64?: string;
  nivelRequerido: number;
  afinidad: string;
  estado: string;
  cooldownMax: number;
  cooldownActual: number;
}

export interface RoutineNode {
  id: string;
  nombre: string;
  desc?: string;
  tipo: string;
  limite: number;
  dificultad: number;
  completada: boolean;
}

export interface RoutinePenalties {
  energia: number;
  estres: number;
  ego: number;
  mood: number;
  limiteMentalRoto: boolean;
  limiteFisicoRoto: boolean;
  limiteSocialRoto: boolean;
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
    // Calculate routine penalties BEFORE resetting
    const est = RoutineService.getEstimation();
    
    let s = GameStateService.updateState(state => {
      // Apply routine penalties
      state.energia = Math.min(state.maxEnergia, state.energia + 4 + est.energia); // +4 is daily base recovery, est.energia is negative
      state.estres = Math.max(0, state.estres + est.estres);
      state.mood = Math.max(0, Math.min(10, state.mood + est.mood));
      state.puntosEgo = Math.max(0, state.puntosEgo + est.ego);

      if (state.limpieza > 0) state.limpieza--;
      state.activeBosses.forEach(b => {
        if (b.estadoFinal !== "terminado" && b.estadoFinal !== "domado") {
          if (b.tipo === "indomable") {
            if (b.hpRupturaActual === 0) {
              b.diasActivos++;
              if (b.diasActivos >= b.limiteDias) {
                b.estadoFinal = "terminado";
              } else {
                b.estadoFinal = "activo";
                b.hpRupturaActual = b.hpRupturaMax;
              }
            } else {
              b.estadoFinal = "enrage";
              if (b.statCastigo === "energia") state.energia = Math.max(0, state.energia - b.valorCastigo);
              else if (b.statCastigo === "estres") state.estres += b.valorCastigo;
              else if (b.statCastigo === "mood") state.mood = Math.max(0, state.mood - b.valorCastigo);
              else if (b.statCastigo === "ego") state.puntosEgo = Math.max(0, state.puntosEgo - b.valorCastigo);
              b.hpRupturaActual = b.hpRupturaMax;
            }
          } else {
            // Domable
            b.diasActivos++;
            if (b.diasActivos > b.limiteDias) {
              b.estadoFinal = "enrage";
              if (b.statCastigo === "energia") state.energia = Math.max(0, state.energia - b.valorCastigo);
              else if (b.statCastigo === "estres") state.estres += b.valorCastigo;
              else if (b.statCastigo === "mood") state.mood = Math.max(0, state.mood - b.valorCastigo);
              else if (b.statCastigo === "ego") state.puntosEgo = Math.max(0, state.puntosEgo - b.valorCastigo);
            }
          }
        }
      });
      state.estres += 1; // base daily stress
      
      // Enforce zero limits again just in case
      state.energia = Math.max(0, state.energia);
      state.estres = Math.max(0, state.estres);
    });

    // Reset for new day AFTER applying penalties
    RoutineService.resetForNewDay();
    EgoService.reduceCooldowns();
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
