namespace WonderWorldAPI.Models;

public class RoutinePenalties
{
    public int Energia { get; set; } = 0;
    public int Estres { get; set; } = 0;
    public int Mood { get; set; } = 0;
    public int Ego { get; set; } = 0;
}

public class RoutineNode
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string Tipo { get; set; } = "diaria";
    public string? FreqType { get; set; }
    public List<int>? Days { get; set; }
    public RoutinePenalties Castigo { get; set; } = new RoutinePenalties();
    public int ReincidenciaCount { get; set; } = 0;
}
