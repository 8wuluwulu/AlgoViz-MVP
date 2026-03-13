public class SortingFactory
{
    private readonly IEnumerable<ISortingStrategy> _strategies;

    public SortingFactory(IEnumerable<ISortingStrategy> strategies)
    {
        _strategies = strategies;
    }

    public ISortingStrategy GetStrategy(string algorithmName)
    {
        var strategy = _strategies.FirstOrDefault(s => s.Name.ToLower() == algorithmName.ToLower());

        if (strategy == null)
        {
            throw new ArgumentException($"Алгоритм с именем '{algorithmName}' не найден.");
        }

        return strategy;
    }
}