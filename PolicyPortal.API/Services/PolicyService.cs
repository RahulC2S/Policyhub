using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _repository;

    public PolicyService(IPolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Policy>> GetPoliciesAsync()
    {
        return await _repository.GetAllAsync();
    }
}