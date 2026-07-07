using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;
using Microsoft.Graph;
using PolicyPortal.API.DTOs;
using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace PolicyPortal.API.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, IWebHostEnvironment environment, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _environment = environment;
        _logger = logger;
    }

    public async Task<EmailSendResultDto> SendPolicyAssignmentNotificationAsync(EmailNotificationDto notification, CancellationToken cancellationToken = default)
    {
        if (notification == null)
        {
            return new EmailSendResultDto
            {
                Success = false,
                Message = "Notification is required.",
                EmailError = "Notification was null."
            };
        }

        var batch = new EmailNotificationBatchDto
        {
            RecipientEmail = notification.RecipientEmail,
            RecipientName = notification.RecipientName,
            LoginUrl = notification.LoginUrl ?? string.Empty,
            Policies = new List<PolicyItemDto>
            {
                new PolicyItemDto
                {
                    PolicyName = notification.PolicyName,
                    AssignedDate = notification.AssignedDate,
                    DueDate = notification.DueDate
                }
            }
        };

        return await SendPolicyAssignmentNotificationAsync(batch, cancellationToken);
    }

    public async Task<EmailSendResultDto> SendPolicyAssignmentNotificationAsync(EmailNotificationBatchDto batch, CancellationToken cancellationToken = default)
    {
        try
        {
            if (batch == null)
            {
                return new EmailSendResultDto { Success = false, Message = "Email batch is required.", EmailError = "Batch null." };
            }

            if (string.IsNullOrWhiteSpace(batch.RecipientEmail))
            {
                return new EmailSendResultDto { Success = false, Message = "Recipient email is required.", EmailError = "Recipient email missing." };
            }

            try
            {
                _ = new MailAddress(batch.RecipientEmail);
            }
            catch (Exception ex)
            {
                return new EmailSendResultDto { Success = false, Message = "Recipient email is invalid.", EmailError = ex.Message };
            }

            ValidateConfiguration();

            _logger.LogInformation("Token acquisition started for shared mailbox {SharedMailbox}", _settings.SharedMailboxEmail);
            var credential = new ClientSecretCredential(_settings.TenantId, _settings.ClientId, _settings.ClientSecret);
            var tokenRequestContext = new TokenRequestContext(new[] { "https://graph.microsoft.com/.default" });
            var accessToken = await credential.GetTokenAsync(tokenRequestContext, cancellationToken);
            _logger.LogInformation("Token acquired. ExpiresAt={ExpiresAt}", accessToken.ExpiresOn);

            var graphClient = new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });
            _logger.LogInformation("Graph client initialized. Sender mailbox={SharedMailbox}", _settings.SharedMailboxEmail);

            var subject = "Action Required: Please Review Your Newly Assigned Policy";

            batch.LoginUrl = string.IsNullOrWhiteSpace(batch.LoginUrl) ? _settings.LoginUrl : batch.LoginUrl;
            var body = EmailTemplateBuilder.BuildPolicyAssignmentHtml(batch);

            var message = new Microsoft.Graph.Models.Message
            {
                Subject = subject,
                Body = new Microsoft.Graph.Models.ItemBody
                {
                    ContentType = Microsoft.Graph.Models.BodyType.Html,
                    Content = body
                },
                ToRecipients = new List<Microsoft.Graph.Models.Recipient>
                {
                    new Microsoft.Graph.Models.Recipient
                    {
                        EmailAddress = new Microsoft.Graph.Models.EmailAddress
                        {
                            Address = batch.RecipientEmail,
                            Name = batch.RecipientName
                        }
                    }
                },
                From = new Microsoft.Graph.Models.Recipient
                {
                    EmailAddress = new Microsoft.Graph.Models.EmailAddress
                    {
                        Address = _settings.SharedMailboxEmail,
                        Name = _settings.SharedMailboxDisplayName
                    }
                }
            };

            _logger.LogInformation("Sending Graph request from {SharedMailbox} to {RecipientEmail}", _settings.SharedMailboxEmail, batch.RecipientEmail);
            var sendRequestBody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
            {
                Message = message,
                SaveToSentItems = false
            };

            await graphClient.Users[_settings.SharedMailboxEmail].SendMail.PostAsync(sendRequestBody);
            _logger.LogInformation("Email send request succeeded. recipient={RecipientEmail}", batch.RecipientEmail);

            return new EmailSendResultDto
            {
                Success = true,
                Message = "Policy assigned successfully and email sent."
            };
        }
        catch (ServiceException ex)
        {
            _logger.LogError(ex, "Graph API email send failed. sharedMailbox={SharedMailbox} recipient={RecipientEmail}", _settings.SharedMailboxEmail, batch?.RecipientEmail);
            return BuildErrorResult("Policy assigned successfully but email failed.", ex, batch?.RecipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected email send failure. sharedMailbox={SharedMailbox} recipient={RecipientEmail}", _settings.SharedMailboxEmail, batch?.RecipientEmail);
            return BuildErrorResult("Policy assigned successfully but email failed.", ex, batch?.RecipientEmail);
        }
    }

    private void ValidateConfiguration()
    {
        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(_settings.TenantId)) missing.Add(nameof(_settings.TenantId));
        if (string.IsNullOrWhiteSpace(_settings.ClientId)) missing.Add(nameof(_settings.ClientId));
        if (string.IsNullOrWhiteSpace(_settings.ClientSecret)) missing.Add(nameof(_settings.ClientSecret));
        if (string.IsNullOrWhiteSpace(_settings.SharedMailboxEmail)) missing.Add(nameof(_settings.SharedMailboxEmail));

        if (missing.Count > 0)
            throw new InvalidOperationException($"Email configuration is incomplete: {string.Join(", ", missing)}");

        try
        {
            _ = new MailAddress(_settings.SharedMailboxEmail);
        }
        catch
        {
            throw new InvalidOperationException("Shared mailbox email is not a valid email address.");
        }
    }

    private EmailSendResultDto BuildErrorResult(string friendlyMessage, Exception exception, string? recipientEmail)
    {
        var graphMessage = exception is ServiceException serviceException ? serviceException.Message : exception.Message;
        var errorMessage = string.IsNullOrWhiteSpace(graphMessage) ? exception.Message : graphMessage;

        return new EmailSendResultDto
        {
            Success = false,
            Message = friendlyMessage,
            EmailError = errorMessage,
            DetailedError = _environment.IsDevelopment() ? exception.ToString() : null
        };
    }
}
