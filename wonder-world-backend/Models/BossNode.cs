namespace WonderWorldAPI.Models;

public class BossNode
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
    
    // domable (Amenaza Domable), indomable (Amenaza Indomable)
    public string Tipo { get; set; } = "domable"; 
    
    public int LimiteDias { get; set; } = 1;
    public int DiasActivos { get; set; } = 0;
    
    public int HpRupturaMax { get; set; } = 1;
    public int HpRupturaActual { get; set; } = 1;
    
    public int HpEjecucionMax { get; set; } = 0;
    public int HpEjecucionActual { get; set; } = 0;
    
    public string Restriccion { get; set; } = "";
    
    // energia, estres, mood, ego
    public string StatCastigo { get; set; } = "estres"; 
    public int ValorCastigo { get; set; } = 1;
    
    // terminado, domado, enrage
    public string EstadoFinal { get; set; } = "";
}
