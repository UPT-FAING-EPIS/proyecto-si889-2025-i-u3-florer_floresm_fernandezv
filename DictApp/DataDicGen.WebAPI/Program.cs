using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Infrastructure.Persistence;
using DataDicGen.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
QuestPDF.Settings.License = LicenseType.Community;
builder.Services.AddEndpointsApiExplorer();

// Configuración mejorada de Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "Data Dictionary Generator API", 
        Version = "v1",
        Description = "API para generar diccionarios de datos a partir de bases de datos SQL Server"
    });
    
    // Habilitar anotaciones XML para una mejor documentación
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Configuración de CORS para permitir solicitudes desde el frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin() // Permitir cualquier origen para desarrollo
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

// Registrar servicios con sus interfaces
builder.Services.AddHttpClient<OpenAIService>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDatabaseMetadataService, DatabaseMetadataService>();
builder.Services.AddScoped<IDocumentGenerator, DocumentGenerator>();
builder.Services.AddSingleton<ICredentialsCacheService, CredentialsCacheService>(); // Nuevo servicio de caché

// Registrar servicios específicos de NoSQL
builder.Services.AddScoped<RedisDatabaseMetadataService>();
builder.Services.AddScoped<CassandraDatabaseMetadataService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Data Dictionary Generator API v1");
        c.DocumentTitle = "Generador de Diccionario de Datos - API";
        
        // Configuración para descargar/visualizar archivos
        c.ConfigObject.AdditionalItems.Add("requestSnippetsEnabled", true);
        c.ConfigObject.AdditionalItems.Add("tryItOutEnabled", true);
        c.ConfigObject.AdditionalItems.Add("displayRequestDuration", true);
    });
}

app.UseHttpsRedirection();

// Usar CORS antes de los controladores
app.UseCors();

app.MapControllers();
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
