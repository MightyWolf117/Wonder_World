using WonderWorldAPI.Models;

namespace WonderWorldAPI.Services;

public interface IEgoService
{
    List<EgoNode> GetAllEgos();
    EgoNode? ActivateEgo(string id);
    void AddEgo(EgoNode newEgo);
    void ProcessMelody(string melody);
}

public class EgoService : IEgoService
{
    private readonly Dictionary<string, EgoNode> _egos;

    public EgoService()
    {
        _egos = new Dictionary<string, EgoNode>
        {
            { "jack", new EgoNode { Id = "jack", NombreNormal = "Jack - Soporte incondicional", NombreCorroido = "Jack - Ansiedad incondicional", CooldownMax = 10, DescNormal = "Activa el instinto Juguetón en tu organismo.", DescCorroida = "Activa el instinto Juguetón. RESTRICCIÓN: Durante el resto de la jornada, tu menú táctico en el Core queda bloqueado." } },
            { "legoshi", new EgoNode { Id = "legoshi", NombreNormal = "Legoshi - Instinto refrenado", NombreCorroido = "Legoshi - Instinto desatado", CooldownMax = 15, DescNormal = "Ejecuta de inmediato la tarea que tienes pendiente sin pensarlo más.", DescCorroida = "Ve y ejecuta todas las tareas que tengas pendientes en tu lista, ignorando por completo la hora de dormir." } },
            { "warwick", new EgoNode { Id = "warwick", NombreNormal = "Warwick - Caza sangrienta", NombreCorroido = "Warwick - Frenesí sangriento", CooldownMax = 20, DescNormal = "Altera tu firma de instinto a Frenesí de manera inmediata.", DescCorroida = "Cambia el instinto a Frenesí. Solo se permite ejecutar Cazas." } },
            { "lycaon", new EgoNode { Id = "lycaon", NombreNormal = "Lycaon - Etiqueta con garras", NombreCorroido = "Lycaon - Obsesión", CooldownMax = 25, DescNormal = "Modifica instantáneamente tu firma a Calmado y reestablece Triage a VERDE.", DescCorroida = "Instinto a Calmado. Solo puedes ejecutar Cazas." } },
            { "hung", new EgoNode { Id = "hung", NombreNormal = "Hung - Muralla de acero", NombreCorroido = "Hung - Escudo canino", CooldownMax = 30, DescNormal = "Anula por completo los efectos restrictivos de una Condición Clínica Negativa.", DescCorroida = "Neutralización total de campos, anula de forma absoluta TODO." } },
            { "wolfstride", new EgoNode { Id = "wolfstride", NombreNormal = "Wolfstride - El Alfa", NombreCorroido = "Wolfstride - Látigo de carne", CooldownMax = 50, DescNormal = "Activa esto para recordar que tu descanso es primero.", DescCorroida = "Sacrificar la hora de dormir a cambio de soltar el látigo y usar la seguridad de tu guarida." } }
        };
    }

    public List<EgoNode> GetAllEgos() => _egos.Values.ToList();

    public EgoNode? ActivateEgo(string id)
    {
        if (_egos.TryGetValue(id, out var ego))
        {
            ego.CooldownActual = ego.CooldownMax;
            return ego;
        }
        return null;
    }

    public void AddEgo(EgoNode newEgo)
    {
        if (!string.IsNullOrEmpty(newEgo.Id) && !_egos.ContainsKey(newEgo.Id))
        {
            _egos[newEgo.Id] = newEgo;
        }
    }

    public void ProcessMelody(string melody)
    {
        if (string.IsNullOrWhiteSpace(melody)) return;
        
        int totalReduction = 0;
        string upper = melody.ToUpper();
        
        foreach (char c in upper)
        {
            if (c == 'S' || c == 'O' || c == 'C') totalReduction += 3;
            else if (c == 'E' || c == 'L') totalReduction += 2;
            else if (c == 'D') totalReduction += 1; 
        }

        foreach (var ego in _egos.Values)
        {
            if (ego.CooldownActual > 0)
            {
                ego.CooldownActual = Math.Max(0, ego.CooldownActual - totalReduction);
            }
        }
    }
}
