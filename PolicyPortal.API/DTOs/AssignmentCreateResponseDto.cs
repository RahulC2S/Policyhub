using PolicyPortal.API.Models;

namespace PolicyPortal.API.DTOs;

public class AssignmentCreateResponseDto
{
    public bool Success { get; set; }
    public bool AssignmentSaved { get; set; }
    public bool EmailSent { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? EmailError { get; set; }
    public string? DetailedError { get; set; }
    public PolicyAssignment? Assignment { get; set; }
}
