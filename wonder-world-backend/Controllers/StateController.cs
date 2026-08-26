using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Services;
using WonderWorldAPI.Models;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StateController : ControllerBase
{
    private readonly IGameStateService _stateService;

    public StateController(IGameStateService stateService)
    {
        _stateService = stateService;
    }

    [HttpGet]
    public ActionResult<GameState> Get()
    {
        return Ok(_stateService.GetState());
    }

    [HttpPost("pasar-dia")]
    public ActionResult<GameState> PasarDia()
    {
        _stateService.PasarDia();
        return Ok(_stateService.GetState());
    }

    [HttpPost("descanso")]
    public ActionResult<GameState> DescansoTotal()
    {
        _stateService.DescansoTotal();
        return Ok(_stateService.GetState());
    }

    [HttpPost("reset")]
    public ActionResult<GameState> ResetDay()
    {
        _stateService.ResetDay();
        return Ok(_stateService.GetState());
    }

    [HttpPost("undo")]
    public ActionResult<GameState> Undo()
    {
        bool success = _stateService.Deshacer();
        if (!success) return BadRequest(new { message = "No hay historial previo." });
        return Ok(_stateService.GetState());
    }

    [HttpPost("import")]
    public ActionResult<GameState> Import([FromBody] GameState newState)
    {
        _stateService.Importar(newState);
        return Ok(_stateService.GetState());
    }
}
