using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlgoViz.Api.Controllers;

[ApiController]
[Route("api/algorithms")]
public class AlgorithmsController : ControllerBase
{
    private const int MaxArraySize = 200;
    private const int MinValue = 1;
    private const int MaxValue = 1000;

    private readonly SortingFactory _algorithmFactory;
    private readonly AppDbContext _context;

    public AlgorithmsController(SortingFactory sortingFactory, AppDbContext context)
    {
        _algorithmFactory = sortingFactory;
        _context = context;
    }

    [HttpGet("{algorithmName}")]
    public async Task<IActionResult> GetSortingSteps(string algorithmName, [FromQuery] int[] array)
    {
        // BUG-05/06: Validate array size and element values
        if (array == null || array.Length == 0)
            return BadRequest("Array is empty.");

        if (array.Length > MaxArraySize)
            return BadRequest($"Array too large. Maximum {MaxArraySize} elements allowed.");

        for (int i = 0; i < array.Length; i++)
        {
            if (array[i] < MinValue || array[i] > MaxValue)
                return BadRequest($"Element at index {i} is out of range [{MinValue}–{MaxValue}].");
        }

        try
        {
            ISortingStrategy strategy = _algorithmFactory.GetStrategy(algorithmName);
            List<StepModel> steps = strategy.Sort(array);

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