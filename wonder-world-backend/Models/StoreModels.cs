namespace WonderWorldAPI.Models;

public class StoreMember
{
    public string Nombre { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public string Efecto { get; set; } = string.Empty;
}

public class StorePlatoon
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string CostoDesc { get; set; } = string.Empty;
    public int CostoMonedas { get; set; } = 0;
    public string ProductoDesc { get; set; } = string.Empty;
    public List<StoreMember> Integrantes { get; set; } = new List<StoreMember>();
}

public class StoreSecretItem
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string CostoDesc { get; set; } = string.Empty;
    public string CostoTipo { get; set; } = string.Empty; // "monedas", "irrompibles", "moneda_evento"
    public int CostoVal { get; set; } = 0;
    public string Efecto { get; set; } = string.Empty;
}

public class StoreCatalog
{
    public List<StorePlatoon> Platoons { get; set; } = new List<StorePlatoon>();
    public List<StoreSecretItem> SecretItems { get; set; } = new List<StoreSecretItem>();
}
