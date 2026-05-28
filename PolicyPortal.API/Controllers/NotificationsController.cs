using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// using PolicyPortal.API.Data;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Notifications.ToList());
    }
}