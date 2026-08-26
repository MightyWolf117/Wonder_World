using WonderWorldAPI.Models;

namespace WonderWorldAPI.Services;

public interface IStoreService
{
    StoreCatalog GetCatalog();
}

public class StoreService : IStoreService
{
    private readonly StoreCatalog _catalog;

    public StoreService()
    {
        _catalog = new StoreCatalog
        {
            Platoons = new List<StorePlatoon>
            {
                new StorePlatoon
                {
                    Id = "beastars",
                    Nombre = "Tropa Beastars",
                    CostoDesc = "1 Moneda",
                    CostoMonedas = 1,
                    ProductoDesc = "+2 Puntos E.G.O.",
                    Integrantes = new List<StoreMember>
                    {
                        new StoreMember { Nombre = "Gouhin", Mensaje = "Sanación del Terapeuta", Efecto = "Sana 1 HP de una Condición Curable." },
                        new StoreMember { Nombre = "Haru", Mensaje = "Vínculo de Jardín", Efecto = "Recupera +2 de Mood." },
                        new StoreMember { Nombre = "Louis", Mensaje = "Orgullo del Venado", Efecto = "+1.0 de EXP Extra en tu siguiente Caza." },
                        new StoreMember { Nombre = "Juno", Mensaje = "Danza de la Lobita", Efecto = "Reduce -2 de Estrés." }
                    }
                },
                new StorePlatoon
                {
                    Id = "zzz",
                    Nombre = "Tropa Zenless Zone Zero",
                    CostoDesc = "1 Moneda",
                    CostoMonedas = 1,
                    ProductoDesc = "+2 Energía",
                    Integrantes = new List<StoreMember>
                    {
                        new StoreMember { Nombre = "Anby", Mensaje = "Sintonía de Hamburguesa", Efecto = "Recupera +1 Energía Extra." },
                        new StoreMember { Nombre = "Belle", Mensaje = "Soporte de la Cueva", Efecto = "Reduce 2 Ticks de Cooldown a un E.G.O." },
                        new StoreMember { Nombre = "Koleda", Mensaje = "Impacto Belobog", Efecto = "Ejecuta 1 Caza consumiendo solo 2 Ticks." },
                        new StoreMember { Nombre = "Corin", Mensaje = "Limpieza Impecable", Efecto = "Evita la pérdida de Triage en la siguiente falla." }
                    }
                },
                new StorePlatoon
                {
                    Id = "limbus",
                    Nombre = "Tropa Limbus Company",
                    CostoDesc = "1 Moneda",
                    CostoMonedas = 1,
                    ProductoDesc = "-2 Estrés",
                    Integrantes = new List<StoreMember>
                    {
                        new StoreMember { Nombre = "Gregor", Mensaje = "Brazo Mutado", Efecto = "Absorbe -1 de Estrés adicional." },
                        new StoreMember { Nombre = "Heathcliff", Mensaje = "Golpe de Furia", Efecto = "+1.0 EXP Extra en Caza." },
                        new StoreMember { Nombre = "Sinclair", Mensaje = "Resonancia Emocional", Efecto = "Recupera +2 de Mood." },
                        new StoreMember { Nombre = "Dante", Mensaje = "Retroceso del Reloj", Efecto = "Resta 3 Ticks de Cooldown a un E.G.O." }
                    }
                }
            },
            SecretItems = new List<StoreSecretItem>
            {
                new StoreSecretItem
                {
                    Id = "pascal",
                    Nombre = "Pascal - Guardián del Abismo",
                    CostoDesc = "1 Moneda Irrompible",
                    CostoTipo = "irrompibles", CostoVal = 1,
                    Efecto = "Obtén 2 Objetos en tu Mochila Táctica."
                },
                new StoreSecretItem
                {
                    Id = "cercal",
                    Nombre = "Cercal - Sombra del Alfa",
                    CostoDesc = "1 Moneda + 1 Evento Positivo",
                    CostoTipo = "moneda_evento", CostoVal = 1,
                    Efecto = "+3 Ticks en tu Tiempo Remanente."
                },
                new StoreSecretItem
                {
                    Id = "beatrice",
                    Nombre = "Beatrice - Bruja Dorada",
                    CostoDesc = "1 Moneda Irrompible",
                    CostoTipo = "irrompibles", CostoVal = 1,
                    Efecto = "+2 Eventos Positivos Asegurados y cambia el Triage a VERDE durante 2 turnos."
                },
                new StoreSecretItem
                {
                    Id = "tanni",
                    Nombre = "Tanni - Hada Guía",
                    CostoDesc = "2 Monedas",
                    CostoTipo = "monedas", CostoVal = 2,
                    Efecto = "Disminuye 12 Ticks de Cooldown a TODOS los Nodos E.G.O."
                }
            }
        };
    }

    public StoreCatalog GetCatalog()
    {
        return _catalog;
    }
}
