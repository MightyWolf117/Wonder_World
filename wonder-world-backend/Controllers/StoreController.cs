using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Models;
using WonderWorldAPI.Services;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoreController : ControllerBase
{
    private readonly IGameStateService _gameStateService;
    private readonly IStoreService _storeService;

    public StoreController(IGameStateService gameStateService, IStoreService storeService)
    {
        _gameStateService = gameStateService;
        _storeService = storeService;
    }

    [HttpGet("catalog")]
    public ActionResult<StoreCatalog> GetCatalog()
    {
        return Ok(_storeService.GetCatalog());
    }

    [HttpPost("trade/{type}")]
    public ActionResult<GameState> Trade(string type)
    {
        // type = "estres_evento", "energia_moneda", "energia_irrompible"
        switch (type.ToLower())
        {
            case "estres_evento":
                // Cost: +1 Pobreza de Estres (Increases Estres by 1) -> Gives: +1 Evento
                _gameStateService.UpdateState(s =>
                {
                    s.Estres += 1;
                    s.Eventos += 1;
                }, "Canje Inverso: +1 Estrés -> +1 Evento Positivo");
                break;
            case "energia_moneda":
                // Cost: 2 Energia -> Gives: 1 Moneda
                var currentEnergiaMon = _gameStateService.GetState().Energia;
                if (currentEnergiaMon >= 2)
                {
                    _gameStateService.UpdateState(s =>
                    {
                        s.Energia -= 2;
                        s.Monedas += 1;
                    }, "Canje Inverso: -2 Energía -> +1 Moneda de Manada");
                }
                else
                {
                    return BadRequest("No hay suficiente energía para este canje.");
                }
                break;
            case "energia_irrompible":
                // Cost: 4 Energia -> Gives: 1 Moneda Irrompible
                var currentEnergiaIrr = _gameStateService.GetState().Energia;
                if (currentEnergiaIrr >= 4)
                {
                    _gameStateService.UpdateState(s =>
                    {
                        s.Energia -= 4;
                        s.MonedasIrrompibles += 1;
                    }, "Canje Inverso: -4 Energía -> +1 Moneda Irrompible");
                }
                else
                {
                    return BadRequest("No hay suficiente energía para este canje.");
                }
                break;
            default:
                return BadRequest("Tipo de canje inválido");
        }
        return Ok(_gameStateService.GetState());
    }

    [HttpPost("buy/platoon/{id}")]
    public ActionResult<GameState> BuyPlatoon(string id)
    {
        var platoon = _storeService.GetCatalog().Platoons.FirstOrDefault(p => p.Id == id);
        if (platoon == null) return NotFound("Tropa no encontrada");

        var state = _gameStateService.GetState();
        if (state.Monedas < platoon.CostoMonedas)
            return BadRequest("Monedas insuficientes");

        _gameStateService.UpdateState(s =>
        {
            s.Monedas -= platoon.CostoMonedas;
            
            // Apply base product (simulated based on ID for MVP)
            if (id == "beastars") s.PuntosEgo = Math.Min(s.MaxEgo, s.PuntosEgo + 2);
            if (id == "zzz") s.Energia = Math.Min(s.MaxEnergia, s.Energia + 2);
            if (id == "limbus") s.Estres = Math.Max(0, s.Estres - 2);

        }, $"Compra de Tienda: {platoon.Nombre} ({platoon.ProductoDesc})");

        return Ok(_gameStateService.GetState());
    }

    [HttpPost("buy/secret/{id}")]
    public ActionResult<GameState> BuySecretItem(string id)
    {
        var item = _storeService.GetCatalog().SecretItems.FirstOrDefault(p => p.Id == id);
        if (item == null) return NotFound("Objeto no encontrado");

        var state = _gameStateService.GetState();
        
        bool canBuy = false;
        if (item.CostoTipo == "irrompibles" && state.MonedasIrrompibles >= item.CostoVal) canBuy = true;
        if (item.CostoTipo == "monedas" && state.Monedas >= item.CostoVal) canBuy = true;
        if (item.CostoTipo == "moneda_evento" && state.Monedas >= item.CostoVal && state.Eventos >= item.CostoVal) canBuy = true;

        if (!canBuy) return BadRequest("Recursos insuficientes");

        _gameStateService.UpdateState(s =>
        {
            if (item.CostoTipo == "irrompibles") s.MonedasIrrompibles -= item.CostoVal;
            if (item.CostoTipo == "monedas") s.Monedas -= item.CostoVal;
            if (item.CostoTipo == "moneda_evento") 
            {
                s.Monedas -= item.CostoVal;
                s.Eventos -= item.CostoVal;
            }

            // Simple MVP implementation of secret effect (no real logic for complex ones yet)
            if (id == "beatrice") s.Eventos += 2;
            if (id == "cercal") s.TicksRestantes += 3;

        }, $"Compra Secreta: {item.Nombre}");

        return Ok(_gameStateService.GetState());
    }
}
