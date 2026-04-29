using AlgoViz.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Подключение БД: приоритет — переменная окружения DATABASE_URL (для Render.com)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services
builder.Services.AddControllers();
builder.Services.AddScoped<ISortingStrategy, BubbleSortStrategy>();
builder.Services.AddScoped<ISortingStrategy, SelectionSortStrategy>();
builder.Services.AddScoped<ISortingStrategy, QuickSortStrategy>();
builder.Services.AddScoped<ISortingStrategy, MergeSortStrategy>();
builder.Services.AddScoped<SortingFactory>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS only in Development (production serves frontend from same origin)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:5233", "http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });
}

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
