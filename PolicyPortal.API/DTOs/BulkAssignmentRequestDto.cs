using System.Collections.Generic;

namespace PolicyPortal.API.DTOs;

public class BulkAssignmentRequestDto
{
    public List<int> PolicyIds { get; set; } = new List<int>();
    public int? AssignedToUserId { get; set; }
    public int? AssignedToDepartmentId { get; set; }
    public string? DueDate { get; set; }
    public bool IsMandatory { get; set; } = true;
}
