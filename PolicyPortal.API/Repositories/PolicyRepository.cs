using Microsoft.EntityFrameworkCore;
// using PolicyPortal.API.Data;
using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Repositories;

public class PolicyRepository : IPolicyRepository
{
    private readonly ApplicationDbContext _context;

    public PolicyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Policy>> GetAllAsync()
    {
        return await _context.Policies.ToListAsync();
    }

    public async Task<List<Policy>> GetByCategoryAsync()
    {
        return await _context.Policies
            .Include(p => p.Category)
            .ToListAsync();
    }
}