namespace AlgoViz.Api.Interfaces;

public interface ISortingStrategy
{
    string Name { get; }
    List<StepModel> Sort(int[] array);
}