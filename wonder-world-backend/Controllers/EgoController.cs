using Microsoft.AspNetCore.Mvc;
using WonderWorldAPI.Services;
using WonderWorldAPI.Models;

namespace WonderWorldAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EgoController : ControllerBase
{
    private readonly IEgoService _egoService;

    public EgoController(IEgoService egoService)
    {
        _egoService = egoService;
    }

    [HttpGet]
    public ActionResult<List<EgoNode>> GetAll()
    {
        return Ok(_egoService.GetAllEgos());
    }

    [HttpPost("activate/{id}")]
    public ActionResult<EgoNode> ActivateEgo(string id)
    {
        var activated = _egoService.ActivateEgo(id);
        if (activated == null) return NotFound(new { message = $"EGO con ID {id} no encontrado." });
        return Ok(activated);
    }

    [HttpPost]
    public ActionResult AddEgo([FromBody] EgoNode newEgo)
    {
        _egoService.AddEgo(newEgo);
        return Ok(_egoService.GetAllEgos());
    }

    public class MelodyRequest { public string Melody { get; set; } = string.Empty; }

    [HttpPost("process-melody")]
    public ActionResult<List<EgoNode>> ProcessMelody([FromBody] MelodyRequest req)
    {
        _egoService.ProcessMelody(req.Melody);
        return Ok(_egoService.GetAllEgos());
    }
}
