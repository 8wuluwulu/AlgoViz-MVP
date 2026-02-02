using Microsoft.AspNetCore.Mvc;

namespace AlgoViz.Api.Controllers;

[ApiController]
[Route("api/algorithms")]
public class AlgorithmsController : ControllerBase
{
    [HttpGet]
    [Route("bubble-sort")]
    public IActionResult GetBubbleSortSteps([FromQuery]int[] array)
    {
        if (array == null || array.Length == 0)
        {
            return BadRequest("Array is empty");
        }

        List<StepModel> steps = BubbleSort(array);
        return Ok(steps);
    }

    private List<StepModel> BubbleSort(int[] array)
    {
        List<StepModel> steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        int stepNumber = 0;
        var step = new StepModel
        {
            StepNumber = stepNumber++,
            Array = (int[])arr.Clone(),
            Description = "Начально состояние массива.",
            ComparedIndices = new int[] { },
            SwappedIndices = new int[] { }
        };
        steps.Add(step);
        for (int i = 0; i < arr.Length - 1; i++)
        {
            for (int j = 0; j < arr.Length - 1 - i; j++)
            {
                var compareStep = new StepModel
                {
                    StepNumber = stepNumber++,
                    Array = (int[])arr.Clone(),
                    Description = $"Сравниваем элементы {arr[j]} и {arr[j + 1]}.",
                    ComparedIndices = new int[] { j, j + 1 },
                    SwappedIndices = new int[] {}
                };
                steps.Add(compareStep);
                if (arr[j] > arr[j + 1])
                {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    var swapStep = new StepModel
                    {
                        StepNumber = stepNumber++,
                        Array = (int[])arr.Clone(),
                        Description = $"Меняем элементы {arr[j]} и {arr[j + 1]}.",
                        ComparedIndices = new int[] { },
                        SwappedIndices = new int[] { j, j + 1 }
                    };
                    steps.Add(swapStep);
                }
            }
        }
        return steps;
    }

    /* private List<StepModel> BubbleSort(int[] array)
    {
        List<StepModel> steps = new List<StepModel>();
        var arr = (int[])array.Clone();
        int stepNumber = 0;
        var firstStep = StepModel
        {
            StepNumber = stepNumber++,
            Array = (int[])arr.Clone(),
            Description = "Начальное состояние массива.",
            ComparedIndices = new int[] {},
            SwappedIndices = new int[] {},
        };
        steps.Add(firstStep);
        
        for (int i = 0; i < arr.Length - 1; i++) {
            for (int j = 0; j < arr.Length - 1 - i; j++) {
                
            }
        }
    } */
}