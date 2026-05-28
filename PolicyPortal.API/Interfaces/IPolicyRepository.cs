using PolicyPortal.API.Models;

namespace PolicyPortal.API.Interfaces;

public interface IPolicyRepository
{
    Task<List<Policy>> GetAllAsync();
    Task<List<Policy>> GetByCategoryAsync();
}