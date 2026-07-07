using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PolicyPortal.API.DTOs;
using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Models;
using PolicyPortal.API.Services;
using System.IO;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PolicyAssignmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly BlobService _blobService;
    private readonly IPolicyAssignmentService _assignmentService;
    private readonly IEmailService _emailService;

    public PolicyAssignmentsController(
        ApplicationDbContext context,
        BlobService blobService,
        IPolicyAssignmentService assignmentService,
        IEmailService emailService)
    {
        _context = context;
        _blobService = blobService;
        _assignmentService = assignmentService;
        _emailService = emailService;
    }

    [HttpGet("{assignmentId}/pdf")]
    public async Task<IActionResult> DownloadAssignmentPdf(int assignmentId)
    {
        var assignment = _context.PolicyAssignments
            .Include(a => a.Policy)
            .FirstOrDefault(a => a.AssignmentId == assignmentId);

        if (assignment == null)
            return NotFound("Assignment not found.");

        if (assignment.Policy == null)
            return NotFound("Related policy not found.");

        var blobPath = assignment.Policy.BlobPath;
        if (string.IsNullOrEmpty(blobPath))
            return NotFound("Policy blob path is missing.");

        try
        {
            var (stream, contentType, fileName) = await _blobService.DownloadBlobAsync(blobPath);
            Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
            return File(stream, contentType);
        }
        catch (FileNotFoundException fnfEx)
        {
            return NotFound(fnfEx.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(502, $"Failed to load policy PDF: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int? userId = null)
    {
        var assignments = await _assignmentService.GetAssignmentsAsync(userId);
        return Ok(assignments);
    }

    [HttpGet("me")]
    [Authorize(Policy = "RequireEmployee")]
    public async Task<IActionResult> GetMine()
    {
        var oid = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? User.FindFirst("oid")?.Value;

        var email = User.FindFirst("upn")?.Value
            ?? User.FindFirst("unique_name")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Upn)?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value
            ?? User.FindFirst("preferred_username")?.Value
            ?? User.FindFirst("preferredUsername")?.Value;

        var currentUser = await _context.Users
            .FirstOrDefaultAsync(u => u.AzureObjectId == oid || (email != null && u.Email.ToLower() == email.ToLower()));

        if (currentUser == null)
            return NotFound();

        return await GetAll(currentUser.UserId);
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public async Task<IActionResult> Create(PolicyAssignment assignment)
    {
        if (assignment == null)
            return BadRequest("Assignment is required.");

        assignment.AssignedDate = DateTime.UtcNow;

        if (assignment.VersionId == 0 || !await _context.PolicyVersions.AnyAsync(v => v.VersionId == assignment.VersionId))
        {
            var version = await _context.PolicyVersions
                .Where(v => v.PolicyId == assignment.PolicyId)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (version == null)
            {
                var policy = await _context.Policies.FindAsync(assignment.PolicyId);
                if (policy != null)
                {
                    version = new PolicyVersion
                    {
                        PolicyId = policy.PolicyId,
                        VersionNumber = "1.0",
                        CreatedAt = DateTime.UtcNow,
                        BlobUrl = policy.BlobPath ?? string.Empty,
                        FileName = Path.GetFileName(policy.BlobPath ?? string.Empty) ?? "policy.pdf",
                        FileType = "application/pdf",
                        FileSize = 0
                    };
                    _context.PolicyVersions.Add(version);
                    await _context.SaveChangesAsync();
                }
            }

            if (version != null)
            {
                assignment.VersionId = version.VersionId;
            }
        }

        _context.PolicyAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        var assignedUser = await _context.Users.FindAsync(assignment.AssignedToUserId);
        var assignmentPolicy = await _context.Policies.FindAsync(assignment.PolicyId);

        var emailNotification = new DTOs.EmailNotificationDto
        {
            RecipientEmail = assignedUser?.Email ?? string.Empty,
            RecipientName = assignedUser?.FullName ?? assignedUser?.Email ?? "Employee",
            PolicyName = assignmentPolicy?.Title ?? "Policy",
            AssignedDate = assignment.AssignedDate ?? DateTime.UtcNow,
            DueDate = assignment.DueDate.HasValue ? assignment.DueDate.Value.ToString("yyyy-MM-dd") : null,
            LoginUrl = string.Empty
        };

        var emailResult = await _emailService.SendPolicyAssignmentNotificationAsync(emailNotification);

        var response = new DTOs.AssignmentCreateResponseDto
        {
            Success = emailResult.Success,
            AssignmentSaved = true,
            EmailSent = emailResult.Success,
            Message = emailResult.Success
                ? "Policy assigned successfully and email sent."
                : "Policy assigned successfully but email failed.",
            EmailError = emailResult.EmailError,
            DetailedError = emailResult.DetailedError,
            Assignment = assignment
        };

        return Ok(response);
    }

    [HttpPost("bulk")]
    [Authorize(Policy = "RequireHRAdmin")]
    public async Task<IActionResult> CreateBulk([FromBody] DTOs.BulkAssignmentRequestDto request)
    {
        if (request == null || request.PolicyIds == null || request.PolicyIds.Count == 0 || request.AssignedToUserId == null)
            return BadRequest("PolicyIds and AssignedToUserId are required.");

        var assignments = new List<PolicyAssignment>();
        foreach (var policyId in request.PolicyIds)
        {
            var assignment = new PolicyAssignment
            {
                PolicyId = policyId,
                AssignedToUserId = request.AssignedToUserId,
                AssignedToDepartmentId = request.AssignedToDepartmentId,
                AssignedDate = DateTime.UtcNow,
                DueDate = !string.IsNullOrWhiteSpace(request.DueDate) ? DateOnly.Parse(request.DueDate) : null,
                IsMandatory = request.IsMandatory
            };

            if (assignment.VersionId == 0)
            {
                var version = await _context.PolicyVersions
                    .Where(v => v.PolicyId == assignment.PolicyId)
                    .OrderByDescending(v => v.CreatedAt)
                    .FirstOrDefaultAsync();

                if (version == null)
                {
                    var policy = await _context.Policies.FindAsync(assignment.PolicyId);
                    if (policy != null)
                    {
                        version = new PolicyVersion
                        {
                            PolicyId = policy.PolicyId,
                            VersionNumber = "1.0",
                            CreatedAt = DateTime.UtcNow,
                            BlobUrl = policy.BlobPath ?? string.Empty,
                            FileName = Path.GetFileName(policy.BlobPath ?? string.Empty) ?? "policy.pdf",
                            FileType = "application/pdf",
                            FileSize = 0
                        };
                        _context.PolicyVersions.Add(version);
                        await _context.SaveChangesAsync();
                    }
                }

                if (version != null)
                {
                    assignment.VersionId = version.VersionId;
                }
            }

            assignments.Add(assignment);
            _context.PolicyAssignments.Add(assignment);
        }

        await _context.SaveChangesAsync();

        var assignedUser = await _context.Users.FindAsync(request.AssignedToUserId);
        var policyItems = new List<DTOs.PolicyItemDto>();
        foreach (var assigned in assignments)
        {
            var policy = await _context.Policies.FindAsync(assigned.PolicyId);
            policyItems.Add(new DTOs.PolicyItemDto
            {
                PolicyName = policy?.Title ?? "Policy",
                AssignedDate = assigned.AssignedDate ?? DateTime.UtcNow,
                DueDate = assigned.DueDate.HasValue ? assigned.DueDate.Value.ToString("yyyy-MM-dd") : null
            });
        }

        var batchNotification = new DTOs.EmailNotificationBatchDto
        {
            RecipientEmail = assignedUser?.Email ?? string.Empty,
            RecipientName = assignedUser?.FullName ?? assignedUser?.Email ?? "Employee",
            Policies = policyItems,
            LoginUrl = string.Empty
        };

        var emailResult = await _emailService.SendPolicyAssignmentNotificationAsync(batchNotification);

        var response = new DTOs.AssignmentCreateResponseDto
        {
            Success = emailResult.Success,
            AssignmentSaved = true,
            EmailSent = emailResult.Success,
            Message = emailResult.Success
                ? "Policy assigned successfully and email sent."
                : "Policy assigned successfully but email failed.",
            EmailError = emailResult.EmailError,
            DetailedError = emailResult.DetailedError,
            Assignment = assignments.FirstOrDefault()
        };

        return Ok(response);
    }
}