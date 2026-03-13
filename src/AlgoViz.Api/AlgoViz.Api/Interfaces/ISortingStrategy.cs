public interface ISortingStrategy
{
    string Name {get;}
    Task<List<StepModel>> SortAsync(int[] array);
}