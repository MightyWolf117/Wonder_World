using System.Text.Json;
using WonderWorldAPI.Models;

namespace WonderWorldAPI.Services;

public interface IGameStateService
{
    GameState GetState();
    void PasarDia();
    void DescansoTotal();
    void ResetDay();
    void RegistrarSnapshot();
    bool Deshacer();
    void Importar(GameState state);
    void UpdateState(Action<GameState> action, string log);
}

public class GameStateService : IGameStateService
{
    private GameState _state;
    private readonly Stack<string> _historial;
    private readonly IRoutineService _routineService;

    public GameStateService(IRoutineService routineService)
    {
        _routineService = routineService;
        _state = new GameState();
        _historial = new Stack<string>();
    }

    public GameState GetState() => _state;

    public void RegistrarSnapshot()
    {
        _historial.Push(JsonSerializer.Serialize(_state));
        if (_historial.Count > 30)
        {
            var arr = _historial.ToArray();
            _historial.Clear();
            for (int i = arr.Length - 2; i >= 0; i--) 
                _historial.Push(arr[i]);
        }
    }

    public void UpdateState(Action<GameState> action, string log)
    {
        RegistrarSnapshot();
        action(_state);
        Console.WriteLine($"[State Change] {log}");
    }

    public void PasarDia()
    {
        RegistrarSnapshot();
        
        // Aplicar penalizaciones de las rutinas
        _routineService.ApplyPenaltiesAndReset(DateTime.Now.DayOfWeek, _state);

        // Limpieza pasiva decae
        if (_state.Limpieza > 0) _state.Limpieza--;

        // Penalizaciones por Jefes (Zona de Caza)
        foreach(var boss in _state.ActiveBosses)
        {
            if (boss.EstadoFinal != "terminado" && boss.EstadoFinal != "domado")
            {
                boss.DiasActivos++;
                if (boss.DiasActivos > boss.LimiteDias)
                {
                    boss.EstadoFinal = "enrage";
                    if (boss.StatCastigo == "energia") _state.Energia -= boss.ValorCastigo;
                    else if (boss.StatCastigo == "estres") _state.Estres += boss.ValorCastigo;
                    else if (boss.StatCastigo == "mood") _state.Mood -= boss.ValorCastigo;
                    else if (boss.StatCastigo == "ego") _state.PuntosEgo -= boss.ValorCastigo;
                }
            }
        }

        _state.Energia = Math.Min(_state.MaxEnergia, _state.Energia + 4);
        _state.Estres += 1;
    }

    public void DescansoTotal()
    {
        RegistrarSnapshot();
        _state.Energia = _state.MaxEnergia;
        _state.Estres = 0;
        _state.TicksRestantes = 20;
    }

    public void ResetDay()
    {
        RegistrarSnapshot();
        _state.TicksRestantes = 20;
    }

    public bool Deshacer()
    {
        if (_historial.Count > 0)
        {
            var json = _historial.Pop();
            _state = JsonSerializer.Deserialize<GameState>(json) ?? new GameState();
            return true;
        }
        return false;
    }

    public void Importar(GameState newState)
    {
        RegistrarSnapshot();
        _state = newState;
    }
}
