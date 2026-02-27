public class AlgorithmRun
{
    public int Id {get ;set;}
    public string AlgorithmName {get; set; } = string.Empty;
    public int ArraySize {get; set; }
    public int StepsCount {get; set;}
    public DateTime CreatedAt {get; set; } = DateTime.UtcNow;
}