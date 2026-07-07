namespace PolicyPortal.API.DTOs;

public class PolicyItemDto
{
    public string PolicyName { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
    public string? DueDate { get; set; }
}
