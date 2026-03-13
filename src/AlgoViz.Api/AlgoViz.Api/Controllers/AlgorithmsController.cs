using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlgoViz.Api.Controllers;

[ApiController]
[Route("api/algorithms")]
public class AlgorithmsController : ControllerBase
{
    private readonly SortingFactory _algorithmFactory;
    private readonly AppDbContext _context;
    public AlgorithmsController(SortingFactory sortingFactory, AppDbContext context)
    {
        _algorithmFactory = sortingFactory;
        _context = context;
    }

    [HttpGet("{algorithmName}")]
    public async Task<IActionResult> GetSortingSteps(string algorithmName, [FromQuery]int[] array)
    {
        if (array == null || array.Length == 0)
        {
            return BadRequest("Array is empty");
        }

        try
        {
            ISortingStrategy strategy = _algorithmFactory.GetStrategy(algorithmName);

            List<StepModel> steps = await strategy.SortAsync(array);

            var runHistory = new AlgorithmRun
            {
                AlgorithmName = strategy.Name, 
                ArraySize = array.Length,
                StepsCount = steps.Count
            };

            _context.AlgorithmRuns.Add(runHistory);
            await _context.SaveChangesAsync();

            return Ok(steps);
        }
        catch (ArgumentException ex) 
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetRunHistory()
    {
        // Обращаемся к нашей БД через Entity Framework
        var history = await _context.AlgorithmRuns
            .OrderByDescending(r => r.CreatedAt) // Сортируем по убыванию даты (свежие сверху)
            .Take(20) // Берем только последние 20 штук, чтобы не перегружать сеть
            .ToListAsync();

        return Ok(history);
    }
}