using System.Collections.Generic;
using System.Threading.Tasks;
using PolicyPortal.API.DTOs;

namespace PolicyPortal.API.Interfaces;

public interface IPolicyAssignmentService
{
    Task<List<PolicyAssignmentDto>> GetAssignmentsAsync(int? userId = null);
}
