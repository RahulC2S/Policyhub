using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// using PolicyPortal.API.Data;
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
        return Ok(_context.PolicyAcknowledgments.ToList());
    }

    [HttpPost]
    public IActionResult Create(PolicyAcknowledgment ack)
    {
        _context.PolicyAcknowledgments.Add(ack);
        _context.SaveChanges();
        return Ok(ack);
    }
}