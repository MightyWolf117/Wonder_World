using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Services;
using WonderWorldAPI.Models;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutineController : ControllerBase
{
    private readonly IRoutineService _routineService;
    private readonly IGameStateService _stateService;

    public RoutineController(IRoutineService routineService, IGameStateService stateService)
    {
        _routineService = routineService;
        _stateService = stateService;
    }

    [HttpGet("all")]
    public ActionResult<List<RoutineNode>> GetAll() => Ok(_routineService.GetAllRoutines());

    [HttpGet("today")]
    public ActionResult<object> GetToday() 
    {
        var active = _routineService.GetActiveRoutinesForToday(DateTime.Now.DayOfWeek);
        var completed = _routineService.GetCompletedToday();
        return Ok(new { active, completed });
    }

    [HttpGet("estimation")]
    public ActionResult<RoutinePenalties> GetEstimation()
    {
        var penalties = _routineService.GetEndOfDayEstimation(DateTime.Now.DayOfWeek);
        return Ok(penalties);
    }

    [HttpPost("complete/{id}")]
    public ActionResult<GameState> CompleteRoutine(string id)
    {
        _routineService.MarkCompleted(id);
        
        // Recompensa básica por completar (1 moneda, 10 EXP)
        var state = _stateService.GetState();
        state.Monedas += 1;
        state.ExpAcumulada += 10;
        
        return Ok(state);
    }

    [HttpPost("skip/{id}")]
    public ActionResult<GameState> SkipRoutine(string id)
    {
        _routineService.MarkSkipped(id);
        return Ok(_stateService.GetState());
    }

    [HttpPost]
    public ActionResult AddRoutine([FromBody] RoutineNode routine)
    {
        _routineService.AddRoutine(routine);
        return Ok(_routineService.GetAllRoutines());
    }
}
