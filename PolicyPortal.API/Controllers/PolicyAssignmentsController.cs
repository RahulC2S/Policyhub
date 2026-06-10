using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
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

    public PolicyAssignmentsController(ApplicationDbContext context, BlobService blobService)
    {
        _context = context;
        _blobService = blobService;
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
    public IActionResult GetAll(int? userId = null)
    {
        var query = _context.PolicyAssignments
            .Include(a => a.Policy)
            .Include(a => a.AssignedToUser)
            .Include(a => a.AssignedToDepartment)
            .Include(a => a.PolicyAcknowledgments)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(a => a.AssignedToUserId == userId.Value);
        }

        var assignments = query.Select(a => new
        {
            assignmentId = a.AssignmentId,
            policyId = a.PolicyId,
            policyTitle = a.Policy.Title,
            blobUrl = !string.IsNullOrEmpty(a.Policy.BlobPath) ? _blobService.GenerateSasToken(a.Policy.BlobPath) : null,
            assignedToUserId = a.AssignedToUserId,
            assignedToUser = a.AssignedToUser != null ? a.AssignedToUser.FullName : null,
            assignedToDepartmentId = a.AssignedToDepartmentId,
            assignedToDepartment = a.AssignedToDepartment != null ? a.AssignedToDepartment.DepartmentName : null,
            a.AssignedDate,
            dueDate = a.DueDate.HasValue ? a.DueDate.Value.ToString("yyyy-MM-dd") : null,
            isMandatory = a.IsMandatory,
            acknowledgments = a.PolicyAcknowledgments.Count
        })
        .ToList();

        return Ok(assignments);
    }

    [HttpGet("me")]
    [Authorize(Policy = "RequireEmployee")]
    public IActionResult GetMine()
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

        var currentUser = _context.Users
            .FirstOrDefault(u => u.AzureObjectId == oid || (email != null && u.Email.ToLower() == email.ToLower()));

        if (currentUser == null)
            return NotFound();

        return GetAll(currentUser.UserId);
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Create(PolicyAssignment assignment)
    {
        if (assignment == null)
            return BadRequest("Assignment is required.");

        assignment.AssignedDate = DateTime.UtcNow;

        if (assignment.VersionId == 0 || !_context.PolicyVersions.Any(v => v.VersionId == assignment.VersionId))
        {
            var version = _context.PolicyVersions
                .Where(v => v.PolicyId == assignment.PolicyId)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefault();

            if (version == null)
            {
                var policy = _context.Policies.Find(assignment.PolicyId);
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
                    _context.SaveChanges();
                }
            }

            if (version != null)
            {
                assignment.VersionId = version.VersionId;
            }
        }

        _context.PolicyAssignments.Add(assignment);
        _context.SaveChanges();
        return Ok(assignment);
    }
}