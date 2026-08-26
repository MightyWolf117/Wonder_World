using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Models;
using WonderWorldAPI.Services;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BossController : ControllerBase
{
    private readonly IGameStateService _gameStateService;

    public BossController(IGameStateService gameStateService)
    {
        _gameStateService = gameStateService;
    }

    [HttpPost]
    public ActionResult<GameState> AddBoss([FromBody] BossNode boss)
    {
        _gameStateService.UpdateState(state => 
        {
            state.ActiveBosses.Add(boss);
        }, $"Jefe Añadido: {boss.Nombre}");
        return Ok(_gameStateService.GetState());
    }

    [HttpDelete("{id}")]
    public ActionResult<GameState> DeleteBoss(string id)
    {
        _gameStateService.UpdateState(state => 
        {
            state.ActiveBosses.RemoveAll(b => b.Id == id);
        }, $"Jefe Eliminado: {id}");
        return Ok(_gameStateService.GetState());
    }

    [HttpPost("attack/{id}")]
    public ActionResult<GameState> AttackBoss(string id, [FromQuery] string freqType)
    {
        // freqType = "C" o "S"
        _gameStateService.UpdateState(state => 
        {
            var boss = state.ActiveBosses.FirstOrDefault(b => b.Id == id);
            if (boss == null || boss.EstadoFinal == "domado" || boss.EstadoFinal == "terminado") return;

            if (state.PoolFrecuencias.ContainsKey(freqType) && state.PoolFrecuencias[freqType] > 0)
            {
                state.PoolFrecuencias[freqType]--;

                if (boss.Tipo == "indomable")
                {
                    if (freqType == "C" && boss.HpRupturaActual > 0)
                    {
                        boss.HpRupturaActual--;
                        if (boss.HpRupturaActual == 0) boss.EstadoFinal = "terminado";
                    }
                }
                else if (boss.Tipo == "domable")
                {
                    if (boss.HpRupturaActual > 0 && freqType == "C")
                    {
                        boss.HpRupturaActual--;
                    }
                    else if (boss.HpRupturaActual == 0 && boss.HpEjecucionActual > 0 && freqType == "S")
                    {
                        boss.HpEjecucionActual--;
                        if (boss.HpEjecucionActual == 0)
                        {
                            boss.EstadoFinal = "domado";
                            state.Monedas++; // Reward for dominating
                        }
                    }
                }
            }
        }, $"Jefe Atacado: {id} con {freqType}");
        
        return Ok(_gameStateService.GetState());
    }
    
    [HttpPost("load-ammo")]
    public ActionResult<GameState> LoadAmmo([FromQuery] string type)
    {
        _gameStateService.UpdateState(state => 
        {
            if (state.PoolFrecuencias.ContainsKey(type))
            {
                state.PoolFrecuencias[type]++;
            }
        }, $"Municion cargada: {type}");
        return Ok(_gameStateService.GetState());
    }
}
