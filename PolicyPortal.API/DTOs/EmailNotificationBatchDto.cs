using System.Collections.Generic;

namespace PolicyPortal.API.DTOs;

public class EmailNotificationBatchDto
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public List<PolicyItemDto> Policies { get; set; } = new List<PolicyItemDto>();
    public string LoginUrl { get; set; } = string.Empty;
}
