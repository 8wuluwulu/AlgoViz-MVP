namespace AlgoViz.Api.Services;

public class SortingFactory
{
    private readonly IEnumerable<ISortingStrategy> _strategies;

    public SortingFactory(IEnumerable<ISortingStrategy> strategies)
    {
        _strategies = strategies;
    }

    public ISortingStrategy GetStrategy(string algorithmName)
    {
        var strategy = _strategies.FirstOrDefault(s =>
            string.Equals(s.Name, algorithmName, StringComparison.OrdinalIgnoreCase));

        if (strategy == null)
            throw new ArgumentException($"Алгоритм с именем '{algorithmName}' не найден.");

        return strategy;
    }
}