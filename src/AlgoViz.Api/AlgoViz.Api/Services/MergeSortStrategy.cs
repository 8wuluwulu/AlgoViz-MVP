namespace AlgoViz.Api.Services;

public class MergeSortStrategy : ISortingStrategy
{
    public string Name => "merge";

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

        int[] tempArray = new int[arr.Length];
        MergeSortRecursive(arr, tempArray, 0, arr.Length - 1, steps);
        return steps;
    }

    private void MergeSortRecursive(int[] arr, int[] tempArray, int left, int right, List<StepModel> steps)
    {
        if (left < right)
        {
            int middle = left + (right - left) / 2;
            MergeSortRecursive(arr, tempArray, left, middle, steps);
            MergeSortRecursive(arr, tempArray, middle + 1, right, steps);
            Merge(arr, tempArray, left, middle, right, steps);
        }
    }

    private void Merge(int[] arr, int[] tempArray, int left, int middle, int right, List<StepModel> steps)
    {
        for (int i = left; i <= right; i++)
            tempArray[i] = arr[i];

        int iLeft = left, iRight = middle + 1, current = left;

        while (iLeft <= middle && iRight <= right)
        {
            steps.Add(new StepModel
            {
                StepNumber = steps.Count,
                Array = (int[])arr.Clone(),
                Description = $"Сравниваем {tempArray[iLeft]} и {tempArray[iRight]}.",
                ComparedIndices = new[] { current, iRight },
                SwappedIndices = Array.Empty<int>(),
                ActiveLine = 3
            });

            if (tempArray[iLeft] <= tempArray[iRight])
            {
                arr[current] = tempArray[iLeft];
                iLeft++;
                steps.Add(new StepModel
                {
                    StepNumber = steps.Count,
                    Array = (int[])arr.Clone(),
                    Description = $"Записываем {arr[current]}.",
                    ComparedIndices = Array.Empty<int>(),
                    SwappedIndices = new[] { current },
                    ActiveLine = 4
                });
            }
            else
            {
                arr[current] = tempArray[iRight];
                iRight++;
                steps.Add(new StepModel
                {
                    StepNumber = steps.Count,
                    Array = (int[])arr.Clone(),
                    Description = $"Записываем {arr[current]}.",
                    ComparedIndices = Array.Empty<int>(),
                    SwappedIndices = new[] { current },
                    ActiveLine = 5
                });
            }
            current++;
        }

        int remaining = middle - iLeft;
        for (int i = 0; i <= remaining; i++)
        {
            arr[current + i] = tempArray[iLeft + i];
            steps.Add(new StepModel
            {
                StepNumber = steps.Count,
                Array = (int[])arr.Clone(),
                Description = "Переносим остаток.",
                ComparedIndices = Array.Empty<int>(),
                SwappedIndices = new[] { current + i },
                ActiveLine = 4
            });
        }
    }
}