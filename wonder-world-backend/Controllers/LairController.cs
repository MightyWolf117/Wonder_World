using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Models;
using WonderWorldAPI.Services;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LairController : ControllerBase
{
    private readonly IGameStateService _gameStateService;

    public LairController(IGameStateService gameStateService)
    {
        _gameStateService = gameStateService;
    }

    [HttpPost("limpieza")]
    public ActionResult<GameState> ModifyLimpieza([FromQuery] int delta)
    {
        _gameStateService.UpdateState(state => 
        {
            state.Limpieza = Math.Clamp(state.Limpieza + delta, 0, 5);
        }, $"Limpieza modificada: {delta}");
        return Ok(_gameStateService.GetState());
    }

    [HttpPost("inject")]
    public ActionResult<GameState> InjectMelody([FromBody] string melody)
    {
        _gameStateService.UpdateState(state => 
        {
            var validas = new HashSet<string> { "S", "O", "L", "D" }; // Ds handled specially
            for (int i = 0; i < melody.Length; i++)
            {
                if (i < melody.Length - 1 && melody[i] == 'D' && melody[i+1] == 'S')
                {
                    state.PoolFrecuencias["Ds"]++;
                    i++;
                }
                else if (validas.Contains(melody[i].ToString()))
                {
                    state.PoolFrecuencias[melody[i].ToString()]++;
                }
            }
        }, $"Melodía inyectada en Guarida");
        return Ok(_gameStateService.GetState());
    }

    [HttpPost("dissolve-s")]
    public ActionResult<GameState> DissolveS([FromQuery] string target)
    {
        _gameStateService.UpdateState(state => 
        {
            if (state.PoolFrecuencias["S"] > 0)
            {
                state.PoolFrecuencias["S"]--;
                if (target == "O") state.PoolFrecuencias["O"] += 1;
                else if (target == "L") state.PoolFrecuencias["L"] += 2;
                else if (target == "Ds") state.PoolFrecuencias["Ds"] += 2;
                else if (target == "D") state.PoolFrecuencias["D"] += 3;
            }
        }, $"S disuelta a {target}");
        return Ok(_gameStateService.GetState());
    }

    public class ActivateSectorRequest
    {
        public List<string> NotesToConsume { get; set; } = new();
    }

    [HttpPost("activate/{sector}")]
    public ActionResult<GameState> ActivateSector(string sector, [FromBody] ActivateSectorRequest req)
    {
        _gameStateService.UpdateState(state => 
        {
            // Consumir notas
            foreach(var note in req.NotesToConsume)
            {
                if (state.PoolFrecuencias.ContainsKey(note) && state.PoolFrecuencias[note] > 0)
                {
                    state.PoolFrecuencias[note]--;
                }
            }

            if (sector == "V" || sector == "IX") 
            {
                state.Limpieza = Math.Clamp(state.Limpieza + (sector == "V" ? 1 : 2), 0, 5);
                state.Estres = Math.Max(0, state.Estres - 1);
            }
            else if (sector == "I" || sector == "II") state.Estres = Math.Max(0, state.Estres - 1);
            else if (sector == "III") state.Mood = Math.Min(10, state.Mood + 1);
            else if (sector == "IV" || sector == "VI" || sector == "VII") 
            {
                state.Estres = Math.Max(0, state.Estres - 2);
                if (sector == "VII") state.PuntosEgo = Math.Min(state.MaxEgo, state.PuntosEgo + 1);
            }
            else if (sector == "VIII") state.Mood = Math.Min(10, state.Mood + 2);
            else if (sector == "X") 
            {
                state.Mood = Math.Min(10, state.Mood + 2);
                state.Estres = Math.Max(0, state.Estres - 1);
            }
            else if (sector == "XI") 
            {
                state.Estres = Math.Max(0, state.Estres - 4);
                state.Mood = Math.Min(10, state.Mood + 2);
            }
        }, $"Sector {sector} activado");
        
        return Ok(_gameStateService.GetState());
    }
}
