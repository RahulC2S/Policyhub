// using Microsoft.AspNetCore.Mvc;
// using PolicyPortal.API.Interfaces;

// namespace PolicyPortal.API.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class PoliciesController : ControllerBase
// {
//     private readonly IPolicyService _service;

//     public PoliciesController(IPolicyService service)
//     {
//         _service = service;
//     }

//     [HttpGet]
//     public async Task<IActionResult> GetPolicies()
//     {
//         var data = await _service.GetPoliciesAsync();
//         return Ok(data);
//     }
// }
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PolicyPortal.API.Models;
using PolicyPortal.API.Repositories;
using PolicyPortal.API.Interfaces;
using System.Threading.Tasks;
using PolicyPortal.API.Services;
namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PoliciesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPolicyRepository _repository;
    private readonly BlobService _blobService;

    public PoliciesController(ApplicationDbContext context, IPolicyRepository repository, BlobService blobService)
    {
        _context = context;
        _repository = repository;
        _blobService = blobService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
{
    var policies = await _context.Policies
        .Include(p => p.Category)
        .ToListAsync();

    var result = policies.Select(p => new
    {
        policyId = p.PolicyId,
        title = p.Title,
        description = p.Description,
        isActive = p.IsActive,
        category = p.Category != null ? p.Category.CategoryName : "",
        blobUrl = _blobService.GenerateSasToken(p.BlobPath)
    });

    return Ok(result);
}

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var policy = _context.Policies
            .Include(p => p.Category)
            .FirstOrDefault(p => p.PolicyId == id);

        if (policy == null)
            return NotFound();

        return Ok(policy);
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Create(Policy policy)
    {
        _context.Policies.Add(policy);
        _context.SaveChanges();

        return Ok(policy);
    }
}