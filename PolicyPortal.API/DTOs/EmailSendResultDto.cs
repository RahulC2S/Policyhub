namespace PolicyPortal.API.DTOs;

public class EmailSendResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? EmailError { get; set; }
    public string? DetailedError { get; set; }
}
