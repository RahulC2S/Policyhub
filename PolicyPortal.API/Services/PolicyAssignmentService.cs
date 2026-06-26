using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PolicyPortal.API.DTOs;
using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Services;

public class PolicyAssignmentService : IPolicyAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly BlobService _blobService;
    private readonly ILogger<PolicyAssignmentService> _logger;

    public PolicyAssignmentService(ApplicationDbContext context, BlobService blobService, ILogger<PolicyAssignmentService> logger)
    {
        _context = context;
        _blobService = blobService;
        _logger = logger;
    }

    public async Task<List<PolicyAssignmentDto>> GetAssignmentsAsync(int? userId = null)
    {
        var query = _context.PolicyAssignments
            .Include(a => a.Policy)
                .ThenInclude(p => p.Category)
            .Include(a => a.AssignedToUser)
            .Include(a => a.AssignedToDepartment)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(a => a.AssignedToUserId == userId.Value);
        }

        var assignments = await query.Select(a => new
        {
            Assignment = a,
            Acknowledgment = _context.PolicyAcknowledgments
                .Where(ack => a.AssignedToUserId != null
                              && ack.AssignmentId == a.AssignmentId
                              && ack.UserId == a.AssignedToUserId)
                .OrderBy(ack => ack.AcknowledgmentId)
                .Select(ack => new { ack.AcknowledgmentId, ack.Status })
                .FirstOrDefault()
        }).ToListAsync();

        return assignments.Select(item =>
        {
            var assignment = item.Assignment;
            var ack = item.Acknowledgment;
            var status = string.IsNullOrWhiteSpace(ack?.Status) ? "Pending" : ack.Status;

            _logger.LogDebug(
                "PolicyAssignment status for assignmentId={AssignmentId} policyId={PolicyId} assignedToUserId={AssignedToUserId} acknowledgmentId={AcknowledgmentId} acknowledgmentStatus={AcknowledgmentStatus} resolvedStatus={ResolvedStatus}",
                assignment.AssignmentId,
                assignment.PolicyId,
                assignment.AssignedToUserId?.ToString() ?? "null",
                ack is null ? "null" : ack.AcknowledgmentId.ToString(),
                ack?.Status ?? "null",
                status);

            return new PolicyAssignmentDto
            {
                AssignmentId = assignment.AssignmentId,
                PolicyId = assignment.PolicyId,
                PolicyTitle = assignment.Policy?.Title ?? string.Empty,
                CategoryName = assignment.Policy?.Category?.CategoryName ?? string.Empty,
                BlobUrl = !string.IsNullOrEmpty(assignment.Policy?.BlobPath) ? _blobService.GenerateSasToken(assignment.Policy!.BlobPath) : null,
                AssignedToUserId = assignment.AssignedToUserId,
                AssignedToUser = assignment.AssignedToUser?.FullName,
                AssignedToDepartmentId = assignment.AssignedToDepartmentId,
                AssignedToDepartment = assignment.AssignedToDepartment?.DepartmentName,
                AssignedDate = assignment.AssignedDate,
                DueDate = assignment.DueDate.HasValue ? assignment.DueDate.Value.ToString("yyyy-MM-dd") : null,
                IsMandatory = assignment.IsMandatory,
                Status = status
            };
        }).ToList();
    }
}
