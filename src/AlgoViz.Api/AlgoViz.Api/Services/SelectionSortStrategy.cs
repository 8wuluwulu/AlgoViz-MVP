namespace AlgoViz.Api.Services;

public class SelectionSortStrategy : ISortingStrategy
{
    public string Name => "selection";

    public async Task<List<StepModel>> SortAsync(int[] array)
    {
        List<StepModel> steps = new List<StepModel>();
        int[] arr = (int[])array.Clone();
        int stepNumber = 0;

        steps.Add(new StepModel { StepNumber = stepNumber++, Array = (int[])arr.Clone(), Description = "Начальное состояние.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { }, ActiveLine = 0 });

        for (int i = 0; i < arr.Length - 1; i++)
        {
            int minIndex = i;
            for (int j = i + 1; j < arr.Length; j++)
            {
                steps.Add(new StepModel
                {
                    StepNumber = stepNumber++, Array = (int[])arr.Clone(), Description = $"Сравниваем {arr[j]} и текущий минимум {arr[minIndex]}.", ComparedIndices = new int[] { j, minIndex }, SwappedIndices = new int[] { },
                    ActiveLine = 3 // Строка: if (arr[j] < arr[minIndex])
                });

                if (arr[j] < arr[minIndex])
                {
                    minIndex = j;
                }
            }

            if (minIndex != i)
            {
                int temp = arr[minIndex];
                arr[minIndex] = arr[i];
                arr[i] = temp;

                steps.Add(new StepModel
                {
                    StepNumber = stepNumber++, Array = (int[])arr.Clone(), Description = $"Меняем местами {arr[i]} и {arr[minIndex]}.", ComparedIndices = new int[] { }, SwappedIndices = new int[] { i, minIndex },
                    ActiveLine = 4 // Строка: Swap(...)
                });
            }
        }
        await Task.Delay(10);
        return steps;
    }
}