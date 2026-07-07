namespace PolicyPortal.API.Models;

public class EmailSettings
{
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string SharedMailboxEmail { get; set; } = string.Empty;
    public string SharedMailboxDisplayName { get; set; } = "Internal Notifications";
    public string LoginUrl { get; set; } = string.Empty;
}
