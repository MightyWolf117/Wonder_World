using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using WonderWorldAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Registrar el servicio Singleton (Authoritative Server State)
builder.Services.AddSingleton<IGameStateService, GameStateService>();
builder.Services.AddSingleton<IRoutineService, RoutineService>();
builder.Services.AddSingleton<IEgoService, EgoService>();
builder.Services.AddSingleton<IStoreService, StoreService>();

// Configurar CORS abierto según indicaciones
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configurar Rate Limiting: Máximo 10 peticiones por segundo
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddFixedWindowLimiter("FixedPolicy", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromSeconds(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Aplicar Middlewares de Seguridad y CORS
app.UseCors("AllowAll");
app.UseRateLimiter();
app.MapControllers().RequireRateLimiting("FixedPolicy");

app.Run();
