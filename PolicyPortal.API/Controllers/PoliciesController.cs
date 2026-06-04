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
using Microsoft.AspNetCore.Http;
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
        createdAt = p.CreatedAt,
        blobUrl = !string.IsNullOrEmpty(p.BlobPath) ? _blobService.GenerateSasToken(p.BlobPath) : null
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

    [HttpPost("upload")]
    [Authorize(Policy = "RequireHRAdmin")]
    public async Task<IActionResult> UploadPolicy([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var blobUrl = await _blobService.UploadBlobAsync(file);
        return Ok(new { blobUrl });
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Create(Policy policy)
    {
        if (policy == null)
            return BadRequest("Policy data required.");

        policy.CreatedAt = DateTime.UtcNow;
        _context.Policies.Add(policy);
        _context.SaveChanges();

        return Ok(policy);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Update(int id, Policy updatedPolicy)
    {
        var policy = _context.Policies.Find(id);
        if (policy == null)
            return NotFound();

        policy.Title = updatedPolicy.Title;
        policy.Description = updatedPolicy.Description;
        policy.CategoryId = updatedPolicy.CategoryId;
        policy.IsActive = updatedPolicy.IsActive;
        policy.BlobPath = updatedPolicy.BlobPath ?? policy.BlobPath;

        _context.SaveChanges();
        return Ok(policy);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Delete(int id)
    {
        var policy = _context.Policies.Find(id);
        if (policy == null)
            return NotFound();

        _context.Policies.Remove(policy);
        _context.SaveChanges();
        return NoContent();
    }
}