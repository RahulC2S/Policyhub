using PolicyPortal.API.DTOs;

namespace PolicyPortal.API.Interfaces;

public interface IEmailService
{
    Task<EmailSendResultDto> SendPolicyAssignmentNotificationAsync(EmailNotificationDto notification, CancellationToken cancellationToken = default);
    Task<EmailSendResultDto> SendPolicyAssignmentNotificationAsync(EmailNotificationBatchDto batch, CancellationToken cancellationToken = default);
}
