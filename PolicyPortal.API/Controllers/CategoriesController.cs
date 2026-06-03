using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PolicyPortal.API.Models;

namespace PolicyPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Categories.ToList());
    }

    [HttpPost]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Create(Category category)
    {
        if (category == null)
            return BadRequest("Category data required.");

        _context.Categories.Add(category);
        _context.SaveChanges();
        return Ok(category);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Update(int id, Category category)
    {
        var existing = _context.Categories.Find(id);
        if (existing == null)
            return NotFound();

        existing.CategoryName = category.CategoryName;
        _context.SaveChanges();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireHRAdmin")]
    public IActionResult Delete(int id)
    {
        var existing = _context.Categories.Find(id);
        if (existing == null)
            return NotFound();

        _context.Categories.Remove(existing);
        _context.SaveChanges();
        return NoContent();
    }
}