using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PolicyPortal.API.Models;
using System.Linq;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult GetAll()
    {
        var users = _context.Users
            .Include(u => u.Role)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.AzureObjectId,
                u.DepartmentId,
                u.RoleId,
                roleName = u.Role != null ? u.Role.RoleName : null,
                u.IsActive,
                u.CreatedAt,
                u.LastLogin
            })
            .ToList();

        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult GetById(int id)
    {
        var user = _context.Users
            .Include(u => u.Role)
            .Where(u => u.UserId == id)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.AzureObjectId,
                u.DepartmentId,
                u.RoleId,
                roleName = u.Role != null ? u.Role.RoleName : null,
                u.IsActive,
                u.CreatedAt,
                u.LastLogin
            })
            .FirstOrDefault();

        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Create(User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(user);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var oid = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? User.FindFirst("oid")?.Value;

        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Upn)?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("preferred_username")?.Value;

        var currentUser = _context.Users
            .Include(u => u.Role)
            .FirstOrDefault(u => u.AzureObjectId == oid || (email != null && u.Email.ToLower() == email.ToLower()));

        if (currentUser == null)
            return NotFound();

        return Ok(new
        {
            currentUser.UserId,
            currentUser.FullName,
            currentUser.Email,
            currentUser.AzureObjectId,
            currentUser.DepartmentId,
            currentUser.RoleId,
            roleName = currentUser.Role != null ? currentUser.Role.RoleName : null,
            currentUser.IsActive,
            currentUser.CreatedAt,
            currentUser.LastLogin
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Email))
            return BadRequest("Email is required");

        var email = request.Email.Trim().ToLower();

        var user = _context.Users
            .FirstOrDefault(u => u.Email.ToLower() == email);

        if (user == null)
            return Unauthorized("Invalid email");

        return Ok(user);
    }
}