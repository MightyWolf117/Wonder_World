namespace WonderWorldAPI.Models;

public class EgoNode
{
    public string Id { get; set; } = string.Empty;
    public string NombreNormal { get; set; } = string.Empty;
    public string NombreCorroido { get; set; } = string.Empty;
    public int CooldownMax { get; set; }
    public int CooldownActual { get; set; } = 0;
    public string DescNormal { get; set; } = string.Empty;
    public string DescCorroida { get; set; } = string.Empty;
}
