namespace AlgoViz.Api.Services;

public class SelectionSortStrategy : ISortingStrategy
{
    public string Name => "selection";

    public List<StepModel> Sort(int[] array)
    {
        var steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        int stepNumber = 0;

        steps.Add(new StepModel
        {
            StepNumber = stepNumber++,
            Array = (int[])arr.Clone(),
            Description = "Начальное состояние.",
            ComparedIndices = Array.Empty<int>(),
            SwappedIndices = Array.Empty<int>(),
            ActiveLine = 0
        });

        for (int i = 0; i < arr.Length - 1; i++)
        {
            int minIndex = i;
            for (int j = i + 1; j < arr.Length; j++)
            {
                steps.Add(new StepModel
                {
                    StepNumber = stepNumber++,
                    Array = (int[])arr.Clone(),
                    Description = $"Сравниваем {arr[j]} и текущий минимум {arr[minIndex]}.",
                    ComparedIndices = new[] { j, minIndex },
                    SwappedIndices = Array.Empty<int>(),
                    ActiveLine = 3
                });

                if (arr[j] < arr[minIndex])
                    minIndex = j;
            }

            if (minIndex != i)
            {
                (arr[i], arr[minIndex]) = (arr[minIndex], arr[i]);

                steps.Add(new StepModel
                {
                    StepNumber = stepNumber++,
                    Array = (int[])arr.Clone(),
                    Description = $"Меняем местами {arr[i]} и {arr[minIndex]}.",
                    ComparedIndices = Array.Empty<int>(),
                    SwappedIndices = new[] { i, minIndex },
                    ActiveLine = 4
                });
            }
        }

        return steps;
    }
}