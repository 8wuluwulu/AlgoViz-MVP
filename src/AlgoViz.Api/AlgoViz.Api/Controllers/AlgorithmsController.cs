using Microsoft.AspNetCore.Mvc;

namespace AlgoViz.Api.Controllers;

[ApiController]
[Route("api/algorithms")]
public class AlgorithmsController : ControllerBase
{
    private readonly ISortingService _sortingService;
    private readonly AppDbContext _context;
    public AlgorithmsController(ISortingService sortingService, AppDbContext context)
    {
        _sortingService = sortingService;
        _context = context;
    }

    [HttpGet]
    [Route("bubble-sort")]
    public async Task<IActionResult> GetBubbleSortSteps([FromQuery]int[] array)
    {
        if (array == null || array.Length == 0)
        {
            return BadRequest("Array is empty");
        }

        List<StepModel> steps = await _sortingService.BubbleSortAsync(array);

        var runHistory = new AlgorithmRun
        {
            AlgorithmName = "BubbleSort",
            ArraySize = array.Length,
            StepsCount = steps.Count
        };

        _context.AlgorithmRuns.Add(runHistory);
        await _context.SaveChangesAsync();

        return Ok(steps);
    }
}