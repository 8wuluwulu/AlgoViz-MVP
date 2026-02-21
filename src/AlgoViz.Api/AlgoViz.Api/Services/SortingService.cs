public class SortingService : ISortingService
{
    public List<StepModel> BubbleSort(int[] array)
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
                    // Запоминаем значения элементов до обмена.
                    int valLeft = arr[j];
                    int valRight = arr[j + 1];
                    
                    // Меняем элементы
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    var swapStep = new StepModel
                    {
                        StepNumber = stepNumber++,
                        Array = (int[])arr.Clone(),
                        Description = $"Меняем элементы {valLeft} и {valRight}.",
                        ComparedIndices = new int[] { },
                        SwappedIndices = new int[] { j, j + 1 }
                    };
                    steps.Add(swapStep);
                }
            }
        }
        return steps;
    }
}