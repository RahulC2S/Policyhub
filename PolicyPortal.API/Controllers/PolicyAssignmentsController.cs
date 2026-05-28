using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// using PolicyPortal.API.Data;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PolicyAssignmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PolicyAssignmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.PolicyAssignments.ToList());
    }

    [HttpPost]
    public IActionResult Create(PolicyAssignment assignment)
    {
        _context.PolicyAssignments.Add(assignment);
        _context.SaveChanges();
        return Ok(assignment);
    }
}