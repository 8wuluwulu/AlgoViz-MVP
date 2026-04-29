using Microsoft.EntityFrameworkCore;

namespace AlgoViz.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AlgorithmRun> AlgorithmRuns { get; set; }
}