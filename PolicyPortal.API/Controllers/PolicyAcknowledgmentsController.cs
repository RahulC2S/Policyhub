using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PolicyPortal.API.Models;
using System.Text;
using System.Security.Cryptography;

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

    public class SignRequest
    {
        public int AssignmentId { get; set; }
        public string? ConsentText { get; set; }
    }

    [HttpPost("sign")]
    public IActionResult Sign([FromBody] SignRequest req)
    {
        if (req == null)
            return BadRequest();
        var oid = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? User.FindFirst("oid")?.Value;

        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Upn)?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("preferred_username")?.Value;

        var currentUser = _context.Users
            .FirstOrDefault(u => u.AzureObjectId == oid || (email != null && u.Email.ToLower() == email.ToLower()));

        if (currentUser == null)
            return NotFound();

        // Check if already signed
        var existingAck = _context.PolicyAcknowledgments
            .FirstOrDefault(a => a.AssignmentId == req.AssignmentId && a.UserId == currentUser.UserId);
        
        if (existingAck != null)
        {
            return Conflict(new { message = "Policy already signed by this user", acknowledgmentId = existingAck.AcknowledgmentId });
        }

        // Create acknowledgment
        var ack = new PolicyAcknowledgment
        {
            AssignmentId = req.AssignmentId,
            UserId = currentUser.UserId,
            Status = "Signed",
            SignedAt = DateTime.UtcNow,
            ConsentText = req.ConsentText
        };

        _context.PolicyAcknowledgments.Add(ack);
        _context.SaveChanges();

        // Create signature
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers["User-Agent"].ToString();

        // build a simple signature hash from user, ip, ua and timestamp
        var payload = $"{currentUser.UserId}|{ack.AcknowledgmentId}|{ip}|{ua}|{DateTime.UtcNow:o}";
        string sigHash;
        using (var sha = SHA256.Create())
        {
            var bytes = Encoding.UTF8.GetBytes(payload);
            sigHash = Convert.ToBase64String(sha.ComputeHash(bytes));
        }

        var sig = new PolicySignature
        {
            AcknowledgmentId = ack.AcknowledgmentId,
            SignedBy = currentUser.UserId,
            SignedAt = DateTime.UtcNow,
            Ipaddress = ip,
            UserAgent = ua,
            SignatureHash = sigHash
        };

        _context.PolicySignatures.Add(sig);
        _context.SaveChanges();

        // Audit log
        var audit = new AuditLog
        {
            UserId = currentUser.UserId,
            Action = "SignedPolicy",
            EntityType = "PolicyAcknowledgment",
            EntityId = ack.AcknowledgmentId,
            Timestamp = DateTime.UtcNow,
            Metadata = $"AssignmentId={ack.AssignmentId};SignatureId={sig.SignatureId}"
        };

        _context.AuditLogs.Add(audit);
        _context.SaveChanges();

        return Ok(new { acknowledgment = ack, signature = sig });
    }
}