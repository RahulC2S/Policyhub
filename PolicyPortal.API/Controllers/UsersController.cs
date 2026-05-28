using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PolicyPortal.API.Models;
using System.Linq;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Users.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var user = _context.Users.Find(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public IActionResult Create(User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(user);
    }

    // ✅ LOGIN API ADDED HERE (INSIDE CLASS)
    [HttpPost("login")]
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