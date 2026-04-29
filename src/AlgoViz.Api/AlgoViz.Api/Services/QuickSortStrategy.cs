namespace AlgoViz.Api.Services;

public class QuickSortStrategy : ISortingStrategy
{
    public string Name => "quick";

    public List<StepModel> Sort(int[] array)
    {
        var steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();

        steps.Add(new StepModel
        {
            StepNumber = steps.Count,
            Array = (int[])arr.Clone(),
            Description = "Начальное состояние.",
            ComparedIndices = Array.Empty<int>(),
            SwappedIndices = Array.Empty<int>(),
            ActiveLine = 0
        });

        QuickSortRecursive(arr, 0, arr.Length - 1, steps);
        return steps;
    }

    private void QuickSortRecursive(int[] arr, int left, int right, List<StepModel> steps)
    {
        if (left < right)
        {
            int pivotIndex = Partition(arr, left, right, steps);
            QuickSortRecursive(arr, left, pivotIndex - 1, steps);
            QuickSortRecursive(arr, pivotIndex + 1, right, steps);
        }
    }

    private int Partition(int[] arr, int left, int right, List<StepModel> steps)
    {
        int pivot = arr[right];
        int i = left - 1;

        for (int j = left; j < right; j++)
        {
            steps.Add(new StepModel
            {
                StepNumber = steps.Count,
                Array = (int[])arr.Clone(),
                Description = $"Сравниваем {arr[j]} с опорным {pivot}.",
                ComparedIndices = new[] { j, right },
                SwappedIndices = Array.Empty<int>(),
                ActiveLine = 2
            });

            if (arr[j] <= pivot)
            {
                i++;
                if (i != j)
                {
                    (arr[i], arr[j]) = (arr[j], arr[i]);
                    steps.Add(new StepModel
                    {
                        StepNumber = steps.Count,
                        Array = (int[])arr.Clone(),
                        Description = $"Меняем {arr[i]} и {arr[j]}.",
                        ComparedIndices = Array.Empty<int>(),
                        SwappedIndices = new[] { i, j },
                        ActiveLine = 3
                    });
                }
            }
        }

        if (i + 1 != right)
        {
            (arr[i + 1], arr[right]) = (arr[right], arr[i + 1]);
            steps.Add(new StepModel
            {
                StepNumber = steps.Count,
                Array = (int[])arr.Clone(),
                Description = "Ставим опорный элемент на место.",
                ComparedIndices = Array.Empty<int>(),
                SwappedIndices = new[] { i + 1, right },
                ActiveLine = 4
            });
        }

        return i + 1;
    }
}