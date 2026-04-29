namespace AlgoViz.Api.Services;

public class BubbleSortStrategy : ISortingStrategy
{
    public string Name => "bubble";

    public List<StepModel> Sort(int[] array)
    {
        var steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        int stepNumber = 0;

        steps.Add(new StepModel
        {
            StepNumber = stepNumber++,
            Array = (int[])arr.Clone(),
            Description = "Начальное состояние массива.",
            ComparedIndices = Array.Empty<int>(),
            SwappedIndices = Array.Empty<int>(),
            ActiveLine = 0
        });

        for (int i = 0; i < arr.Length - 1; i++)
        {
            for (int j = 0; j < arr.Length - 1 - i; j++)
            {
                steps.Add(new StepModel
                {
                    StepNumber = stepNumber++,
                    Array = (int[])arr.Clone(),
                    Description = $"Сравниваем элементы {arr[j]} и {arr[j + 1]}.",
                    ComparedIndices = new[] { j, j + 1 },
                    SwappedIndices = Array.Empty<int>(),
                    ActiveLine = 2
                });

                if (arr[j] > arr[j + 1])
                {
                    int valLeft = arr[j];
                    int valRight = arr[j + 1];

                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);

                    steps.Add(new StepModel
                    {
                        StepNumber = stepNumber++,
                        Array = (int[])arr.Clone(),
                        Description = $"Меняем элементы {valLeft} и {valRight}.",
                        ComparedIndices = Array.Empty<int>(),
                        SwappedIndices = new[] { j, j + 1 },
                        ActiveLine = 3
                    });
                }
            }
        }

        return steps;
    }
}