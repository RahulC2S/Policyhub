namespace PolicyPortal.API.DTOs;

public class EmailNotificationDto
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string PolicyName { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
    public string? DueDate { get; set; }
    public string LoginUrl { get; set; } = string.Empty;
}
