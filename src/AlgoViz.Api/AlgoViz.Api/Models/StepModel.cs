namespace AlgoViz.Api.Models;

public class StepModel
{
    public int StepNumber { get; set; }
    public int[] Array { get; set; } = System.Array.Empty<int>();
    public string Description { get; set; } = string.Empty;
    public int[] ComparedIndices { get; set; } = System.Array.Empty<int>();
    public int[] SwappedIndices { get; set; } = System.Array.Empty<int>();
    public int ActiveLine { get; set; }
}