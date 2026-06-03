using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PolicyAcknowledgmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PolicyAcknowledgmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var acknowledgments = _context.PolicyAcknowledgments
            .Include(a => a.Assignment).ThenInclude(a => a.Policy)
            .Include(a => a.User)
            .Select(a => new
            {
                acknowledgmentId = a.AcknowledgmentId,
                a.AssignmentId,
                assignmentTitle = a.Assignment.Policy.Title,
                a.UserId,
                userName = a.User.FullName,
                a.Status,
                a.SignedAt,
                a.ConsentText
            })
            .ToList();

        return Ok(acknowledgments);
    }

    [HttpGet("me")]
    [Authorize(Policy = "RequireEmployee")]
    public IActionResult GetMine()
    {
        var oid = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? User.FindFirst("oid")?.Value;

        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Upn)?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("preferred_username")?.Value;

        var currentUser = _context.Users
            .FirstOrDefault(u => u.AzureObjectId == oid || (email != null && u.Email.ToLower() == email.ToLower()));

        if (currentUser == null)
            return NotFound();

        var acknowledgments = _context.PolicyAcknowledgments
            .Include(a => a.Assignment).ThenInclude(a => a.Policy)
            .Where(a => a.UserId == currentUser.UserId)
            .Select(a => new
            {
                acknowledgmentId = a.AcknowledgmentId,
                a.AssignmentId,
                assignmentTitle = a.Assignment.Policy.Title,
                a.Status,
                a.SignedAt,
                a.ConsentText
            })
            .ToList();

        return Ok(acknowledgments);
    }

    [HttpPost]
    public IActionResult Create(PolicyAcknowledgment ack)
    {
        _context.PolicyAcknowledgments.Add(ack);
        _context.SaveChanges();
        return Ok(ack);
    }
}