using Microsoft.AspNetCore.Mvc;

namespace AlgoViz.Api.Controllers;

[ApiController]
[Route("api/algorithms")]
public class AlgorithmsController : ControllerBase
{
    private readonly ISortingService _sortingService;
    public AlgorithmsController(ISortingService sortingService)
    {
        _sortingService = sortingService;
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
        return Ok(steps);
    }
}