import { StorageService } from "./StorageService";
import { GameState } from "../api/client";

const STATE_KEY = "wonder_world_state";

export const getInitialGameState = (): GameState => ({
  energia: 25,
  maxEnergia: 25,
  estres: 0,
  puntosEgo: 0,
  maxEgo: 10,
  nivelEgo: 1,
  mood: 10,
  monedas: 0,
  monedasIrrompibles: 0,
  rangoActual: "Lobo Errante | Rango E",
  afinidadMatrix: "Rebelión",
  sincronizacion: 100,
  corrupcion: 0,
  eventos: 0,
  rompeLimites: 0,
  inestabilidad: 0,
  triage: "estable",
  limpieza: 5,
  poolFrecuencias: { "C": 0, "S": 0, "D": 0, "Ds": 0, "L": 0, "O": 0 },
  activeBosses: []
});

export const GameStateService = {
  getState: (): GameState => {
    const saved = StorageService.load<GameState>(STATE_KEY);
    return saved || getInitialGameState();
  },

  updateState: (mutator: (state: GameState) => void): GameState => {
    const state = GameStateService.getState();
    mutator(state);
    
    // Evaluate Global Bounds
    state.energia = Math.max(0, Math.min(state.maxEnergia, state.energia));
    state.estres = Math.max(0, state.estres);
    state.puntosEgo = Math.max(0, Math.min(state.maxEgo, state.puntosEgo));
    state.mood = Math.max(0, Math.min(10, state.mood));
    
    // Level Up Logic (EGO)
    if (state.puntosEgo >= state.maxEgo) {
      state.nivelEgo++;
      state.puntosEgo = 0;
      state.maxEgo += 2;
    }

    StorageService.save(STATE_KEY, state);
    return state;
  },

  reset: (): GameState => {
    const initial = getInitialGameState();
    StorageService.save(STATE_KEY, initial);
    return initial;
  }
};
