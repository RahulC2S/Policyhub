using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// using PolicyPortal.API.Data;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PolicySignaturesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PolicySignaturesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.PolicySignatures.ToList());
    }

    [HttpPost]
    public IActionResult Create(PolicySignature sig)
    {
        _context.PolicySignatures.Add(sig);
        _context.SaveChanges();
        return Ok(sig);
    }
}