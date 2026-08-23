import { GameStateService } from "./GameStateService";

export const StoreService = {
  getCatalog: () => {
    return { 
      platoons: [
        { 
          id: "s_1", nombre: "Tropa Beastars", costoMonedas: 1, costoDesc: "1 Moneda de Manada", productoDesc: "+2 Puntos E.G.O.",
          integrantes: [
            { nombre: "Legoshi", mensaje: "Lobo gris", efecto: "Fuerza Bruta" },
            { nombre: "Haru", mensaje: "Coneja blanca", efecto: "Empatía" },
            { nombre: "Louis", mensaje: "Ciervo rojo", efecto: "Liderazgo" }
          ]
        },
        { 
          id: "s_2", nombre: "Tropa Zenless Zone Zero", costoMonedas: 1, costoDesc: "1 Moneda de Manada", productoDesc: "+2 Energía",
          integrantes: [
            { nombre: "Anby", mensaje: "Demolition", efecto: "Ataque Rápido" },
            { nombre: "Billy", mensaje: "Cyborg", efecto: "Fuego Cruzado" },
            { nombre: "Nicole", mensaje: "Líder", efecto: "Gestión" }
          ]
        },
        { 
          id: "s_3", nombre: "Tropa Limbus Company", costoMonedas: 1, costoDesc: "1 Moneda de Manada", productoDesc: "-2 Estrés",
          integrantes: [
            { nombre: "Faust", mensaje: "Intelecto", efecto: "Cálculo" },
            { type: "Don Quixote", mensaje: "Justicia", efecto: "Frenesí" },
            { nombre: "Heathcliff", mensaje: "Furia", efecto: "Violencia" }
          ]
        }
      ],
      secretItems: [
        { id: "sec_1", nombre: "Bálsamo del Vacío", efecto: "Cura 5 de Estrés por completo", costoDesc: "1 Moneda Irrompible", costo: 1 },
        { id: "sec_2", nombre: "Sobrecarga Biológica", efecto: "+10 Energía al instante", costoDesc: "1 Moneda Irrompible", costo: 1 },
        { id: "sec_3", nombre: "Sincronización Profunda", efecto: "+5 Puntos E.G.O.", costoDesc: "1 Moneda Irrompible", costo: 1 }
      ],
      items: []
    };
  },

  trade: (type: string, amount: number = 1) => {
    let success = false;
    const newState = GameStateService.updateState(state => {
      if (type === "estres_evento") {
        state.estres += (1 * amount);
        state.eventos += (1 * amount);
        success = true;
      } else if (type === "energia_moneda") {
        if (state.energia >= (2 * amount)) {
          state.energia -= (2 * amount);
          state.monedas += (1 * amount);
          success = true;
        }
      } else if (type === "energia_irrompible") {
        if (state.energia >= (4 * amount)) {
          state.energia -= (4 * amount);
          state.monedasIrrompibles += (1 * amount);
          success = true;
        }
      }
    });
    if (!success) throw new Error("Recursos insuficientes");
    return newState;
  },

  buyPlatoon: (id: string) => {
    let success = false;
    const newState = GameStateService.updateState(state => {
      if (state.monedas >= 1) {
        state.monedas -= 1;
        if (id === "s_1") state.puntosEgo = Math.min(state.maxEgo, state.puntosEgo + 2);
        else if (id === "s_2") state.energia = Math.min(state.maxEnergia, state.energia + 2);
        else if (id === "s_3") state.estres = Math.max(0, state.estres - 2);
        success = true;
      }
    });
    if (!success) throw new Error("Monedas insuficientes");
    return newState;
  },

  buyItem: (type: string, amount: number) => {
    let success = false;
    const newState = GameStateService.updateState(state => {
      if (type === "monedas") {
        if (state.energia >= amount * 2) {
          state.energia -= amount * 2;
          state.monedas += amount;
          success = true;
        }
      }
    });
    if (!success) throw new Error("Recursos insuficientes");
    return newState;
  },

  buySecret: (id: string) => {
    let success = false;
    const newState = GameStateService.updateState(state => {
      if (state.monedasIrrompibles >= 1) {
        state.monedasIrrompibles -= 1;
        if (id === "sec_1") state.estres = Math.max(0, state.estres - 5);
        else if (id === "sec_2") state.energia = Math.min(state.maxEnergia, state.energia + 10);
        else if (id === "sec_3") state.puntosEgo = Math.min(state.maxEgo, state.puntosEgo + 5);
        success = true;
      }
    });
    if (!success) throw new Error("Monedas Irrompibles insuficientes");
    return newState;
  }
};
