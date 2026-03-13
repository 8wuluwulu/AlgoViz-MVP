namespace AlgoViz.Api.Services;

public class QuickSortStrategy : ISortingStrategy
{
    public string Name => "quick";

    public async Task<List<StepModel>> SortAsync(int[] array)
    {
        List<StepModel> steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        steps.Add(new StepModel { StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = "Начальное состояние.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { }, ActiveLine = 0 });
        await QuickSortRecursive(arr, 0, arr.Length - 1, steps);
        await Task.Delay(10);
        return steps;
    }

    private async Task QuickSortRecursive(int[] arr, int left, int right, List<StepModel> steps)
    {
        if (left < right)
        {
            int pivotIndex = await Partition(arr, left, right, steps);
            await QuickSortRecursive(arr, left, pivotIndex - 1, steps);
            await QuickSortRecursive(arr, pivotIndex + 1, right, steps);
        }
    }

    private async Task<int> Partition(int[] arr, int left, int right, List<StepModel> steps)
    {
        int pivot = arr[right];
        int i = left - 1;

        for (int j = left; j < right; j++)
        {
            steps.Add(new StepModel
            {
                StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Сравниваем {arr[j]} с опорным {pivot}.", ComparedIndices = new int[] { j, right }, SwappedIndices = new int[] { },
                ActiveLine = 2 // Строка: if (arr[j] <= pivot)
            });

            if (arr[j] <= pivot)
            {
                i++;
                if (i != j)
                {
                    Swap(arr, i, j);
                    steps.Add(new StepModel
                    {
                        StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Меняем {arr[i]} и {arr[j]}.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { i, j },
                        ActiveLine = 3 // Строка: Swap(ref arr[i], ref arr[j])
                    });
                }
            }
        }

        if (i + 1 != right)
        {
            Swap(arr, i + 1, right);
            steps.Add(new StepModel
            {
                StepNumber = steps.Count, Array = (int[])arr.Clone(), Description = $"Ставим опорный элемент на место.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { i + 1, right },
                ActiveLine = 4 // Строка: Swap опорного
            });
        }
        return i + 1;
    }

    private void Swap(int[] arr, int i, int j)
    {
        int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
    }
}