using System;

namespace PolicyPortal.API.DTOs;

public class PolicyAssignmentDto
{
    public int AssignmentId { get; set; }
    public int PolicyId { get; set; }
    public string PolicyTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? BlobUrl { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUser { get; set; }
    public int? AssignedToDepartmentId { get; set; }
    public string? AssignedToDepartment { get; set; }
    public DateTime? AssignedDate { get; set; }
    public string? DueDate { get; set; }
    public bool? IsMandatory { get; set; }
    public string Status { get; set; } = string.Empty;
}
