namespace AlgoViz.Api.Services;

public class MergeSortStrategy : ISortingStrategy
{
    public string Name => "merge";

    public async Task<List<StepModel>> SortAsync(int[] array)
    {
        List<StepModel> steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        steps.Add(new StepModel { StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = "Начальное состояние.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { }, ActiveLine = 0 });
        int[] tempArray = new int[arr.Length];
        await MergeSortRecursive(arr, tempArray, 0, arr.Length - 1, steps);
        await Task.Delay(10);
        return steps;
    }

    private async Task MergeSortRecursive(int[] arr, int[] tempArray, int left, int right, List<StepModel> steps)
    {
        if (left < right)
        {
            int middle = left + (right - left) / 2;
            await MergeSortRecursive(arr, tempArray, left, middle, steps);
            await MergeSortRecursive(arr, tempArray, middle + 1, right, steps);
            await Merge(arr, tempArray, left, middle, right, steps);
        }
    }

    private async Task Merge(int[] arr, int[] tempArray, int left, int middle, int right, List<StepModel> steps)
    {
        for (int i = left; i <= right; i++) tempArray[i] = arr[i];

        int iLeft = left; int iRight = middle + 1; int current = left;

        while (iLeft <= middle && iRight <= right)
        {
            steps.Add(new StepModel
            {
                StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Сравниваем {tempArray[iLeft]} и {tempArray[iRight]}.", ComparedIndices = new int[] { current, iRight }, SwappedIndices = new int[] { },
                ActiveLine = 3 // Строка: if (temp[iLeft] <= temp[iRight])
            });

            if (tempArray[iLeft] <= tempArray[iRight])
            {
                arr[current] = tempArray[iLeft];
                iLeft++;
                steps.Add(new StepModel { StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Записываем {arr[current]}.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { current }, ActiveLine = 4 });
            }
            else
            {
                arr[current] = tempArray[iRight];
                iRight++;
                steps.Add(new StepModel { StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Записываем {arr[current]}.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { current }, ActiveLine = 5 });
            }
            current++;
        }

        int remaining = middle - iLeft;
        for (int i = 0; i <= remaining; i++)
        {
            arr[current + i] = tempArray[iLeft + i];
            steps.Add(new StepModel { StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Переносим остаток.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { current + i }, ActiveLine = 4 });
        }
    }
}