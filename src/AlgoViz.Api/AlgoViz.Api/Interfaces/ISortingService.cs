public interface ISortingService
{
    Task<List<StepModel>> BubbleSortAsync(int[] array);
}