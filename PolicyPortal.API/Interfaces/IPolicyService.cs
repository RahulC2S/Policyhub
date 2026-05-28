using PolicyPortal.API.Models;

namespace PolicyPortal.API.Interfaces;

public interface IPolicyService
{
    Task<List<Policy>> GetPoliciesAsync();
}