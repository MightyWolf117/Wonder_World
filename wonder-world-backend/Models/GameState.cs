namespace WonderWorldAPI.Models;

public class GameState
{
    public int Energia { get; set; } = 8;
    public int MaxEnergia { get; set; } = 8;
    public int Estres { get; set; } = 0;
    public int PuntosEgo { get; set; } = 7;
    public int MaxEgo { get; set; } = 15;
    public int TicksRestantes { get; set; } = 20;
    public int Mood { get; set; } = 6;
    public double ExpAcumulada { get; set; } = 0.0;
    public int Monedas { get; set; } = 0;
    public int MonedasIrrompibles { get; set; } = 0;
    public int Eventos { get; set; } = 0;
    public int RompeLimites { get; set; } = 0;

    // Phase 6 Additions
    public int Limpieza { get; set; } = 5;
    public Dictionary<string, int> PoolFrecuencias { get; set; } = new()
    {
        {"C", 0}, {"S", 0}, {"L", 0}, {"O", 0}, {"Ds", 0}, {"D", 0}
    };
    public List<BossNode> ActiveBosses { get; set; } = new List<BossNode>();
    
    // Triage / Inestabilidad = Estrés - (Energía + Mood)
    public int Inestabilidad => Estres - (Energia + Mood);
    
    public string Triage 
    {
        get 
        {
            if (Inestabilidad < -6) return "Verde";
            if (Inestabilidad <= -3) return "Amarillo";
            return "Rojo";
        }
    }
}
