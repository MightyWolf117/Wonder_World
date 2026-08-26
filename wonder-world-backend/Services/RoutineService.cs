using WonderWorldAPI.Models;

namespace WonderWorldAPI.Services;

public interface IRoutineService
{
    List<RoutineNode> GetAllRoutines();
    List<RoutineNode> GetActiveRoutinesForToday(DayOfWeek today);
    List<string> GetCompletedToday();
    RoutinePenalties GetEndOfDayEstimation(DayOfWeek today);
    void MarkCompleted(string id);
    void MarkSkipped(string id);
    void ApplyPenaltiesAndReset(DayOfWeek today, GameState state);
    void AddRoutine(RoutineNode routine);
}

public class RoutineService : IRoutineService
{
    private readonly Dictionary<string, RoutineNode> _routines;
    private readonly HashSet<string> _completedToday;

    public RoutineService()
    {
        _completedToday = new HashSet<string>();
        _routines = new Dictionary<string, RoutineNode>
        {
            { "r1", new RoutineNode { Id = "r1", Nombre = "Minoxidil", Desc = "Asegurar folículo matutino", Tipo = "diaria", Castigo = new RoutinePenalties { Ego = -1 } } },
            { "r2", new RoutineNode { Id = "r2", Nombre = "Bañarse", Desc = "Higiene personal profunda", Tipo = "nodiaria", FreqType = "semanal", Days = new List<int> { 1, 3, 6 }, Castigo = new RoutinePenalties { Mood = -1 } } },
            { "r3", new RoutineNode { Id = "r3", Nombre = "Arreglarse la barba", Desc = "Perfilado y elegancia Lycaon", Tipo = "nodiaria", FreqType = "semanal", Days = new List<int> { 6 }, Castigo = new RoutinePenalties { Ego = -1 } } },
            { "r4", new RoutineNode { Id = "r4", Nombre = "Tomar las vitaminas", Desc = "Suministro biológico suplementario", Tipo = "nodiaria", FreqType = "interdiario", Castigo = new RoutinePenalties { Energia = -1 } } },
            { "r5", new RoutineNode { Id = "r5", Nombre = "Escribir en el diario", Desc = "Registro mental nocturno", Tipo = "diaria", Castigo = new RoutinePenalties { Estres = 1 } } }
        };
    }

    public List<RoutineNode> GetAllRoutines() => _routines.Values.ToList();
    
    public List<string> GetCompletedToday() => _completedToday.ToList();

    public List<RoutineNode> GetActiveRoutinesForToday(DayOfWeek today)
    {
        int dayInt = (int)today; 
        var active = new List<RoutineNode>();
        
        foreach (var r in _routines.Values)
        {
            if (r.Tipo == "diaria") active.Add(r);
            else if (r.Tipo == "nodiaria" && r.FreqType == "semanal" && r.Days != null && r.Days.Contains(dayInt)) active.Add(r);
            else if (r.Tipo == "nodiaria" && r.FreqType == "interdiario" && (dayInt % 2 == 0)) active.Add(r);
        }
        return active;
    }

    public void MarkCompleted(string id)
    {
        if (_routines.ContainsKey(id))
            _completedToday.Add(id);
    }

    public void MarkSkipped(string id)
    {
        _completedToday.Remove(id);
    }

    public RoutinePenalties GetEndOfDayEstimation(DayOfWeek today)
    {
        var active = GetActiveRoutinesForToday(today);
        var sum = new RoutinePenalties();
        foreach (var r in active)
        {
            if (!_completedToday.Contains(r.Id))
            {
                sum.Energia += r.Castigo.Energia;
                sum.Estres += r.Castigo.Estres;
                sum.Mood += r.Castigo.Mood;
                sum.Ego += r.Castigo.Ego;
            }
        }
        return sum;
    }

    public void ApplyPenaltiesAndReset(DayOfWeek today, GameState state)
    {
        var penalties = GetEndOfDayEstimation(today);
        
        state.Energia = Math.Max(0, state.Energia + penalties.Energia);
        state.Estres = Math.Max(0, state.Estres + penalties.Estres); // Nota: un estres positivo suma, si el castigo es +1, se suma.
        state.Mood = Math.Max(0, state.Mood + penalties.Mood);
        state.PuntosEgo = Math.Max(0, state.PuntosEgo + penalties.Ego);

        _completedToday.Clear();
    }

    public void AddRoutine(RoutineNode routine)
    {
        if (!string.IsNullOrEmpty(routine.Id) && !_routines.ContainsKey(routine.Id))
            _routines[routine.Id] = routine;
    }
}
