using System.Net;
using System.Text;
using PolicyPortal.API.DTOs;

namespace PolicyPortal.API.Services;

public static class EmailTemplateBuilder
{
    public static string BuildPolicyAssignmentHtml(EmailNotificationBatchDto batch)
    {
        var count = batch.Policies?.Count ?? 0;
        // var sb = new StringBuilder();

        // sb.AppendLine("<!DOCTYPE html>");
        // sb.AppendLine("<html>");
        // sb.AppendLine("  <head>");
        // sb.AppendLine("    <meta charset=\"UTF-8\" />");
        // sb.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />");
        // sb.AppendLine("  </head>");
        // sb.AppendLine("  <body style=\"margin:0;padding:0;background:#eef2f7;font-family:Segoe UI, Arial, sans-serif;color:#1f2937;\"> ");
        // sb.AppendLine("    <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:680px;margin:0 auto;padding:0;\"> ");
        // // sb.AppendLine("      <tr>\n        <td style=\"background:#003366;padding:24px 16px;text-align:center;\">\n          <div style=\"margin:0 auto;max-width:500px;\">\n              </td>\n      </tr>");
        // sb.AppendLine("      <tr>\n        <td style=\"background:#ffffff;padding:24px 24px 16px 24px;border:1px solid #d1d5db;border-top:none;\">\n          <p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#1f2937;\">Hello " + HtmlEncode(batch.RecipientName) + ",</p>\n          <p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.75;color:#4b5563;\">The following policy/policies have been assigned to you. Please review and acknowledge them before the due date.</p>\n        </td>\n      </tr>");
        // sb.AppendLine("      <tr>\n        <td style=\"background:#ffffff;padding:0 24px 24px 24px;border:1px solid #d1d5db;border-top:none;\">\n          <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;min-width:100%;\">\n            <thead>\n              <tr style=\"background:#0056b3;color:#ffffff;text-align:left;\">\n                <th style=\"padding:14px 12px;font-size:14px;font-weight:700;border-bottom:1px solid #bbe1ff;\">Policy Name</th>\n                <th style=\"padding:14px 12px;font-size:14px;font-weight:700;border-bottom:1px solid #bbe1ff;\">Assigned Date</th>\n                <th style=\"padding:14px 12px;font-size:14px;font-weight:700;border-bottom:1px solid #bbe1ff;\">Due Date</th>\n              </tr>\n            </thead>\n            <tbody>");

        // var odd = false;
        // foreach (var policy in batch.Policies)
        // {
        //     var rowColor = odd ? "#f8fafc" : "#ffffff";
        //     sb.AppendLine("              <tr style=\"background:" + rowColor + ";\">\n                <td style=\"padding:14px 12px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;\">" + HtmlEncode(policy.PolicyName) + "</td>\n                <td style=\"padding:14px 12px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;\">" + HtmlEncode(policy.AssignedDate.ToString("yyyy-MM-dd")) + "</td>\n                <td style=\"padding:14px 12px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;\">" + HtmlEncode(policy.DueDate ?? "Not provided") + "</td>\n              </tr>");
        //     odd = !odd;
        // }

        // sb.AppendLine("            </tbody>\n          </table>\n        </td>\n      </tr>");
        // sb.AppendLine("      <tr>\n        <td style=\"background:#ffffff;padding:0 24px 32px 24px;border:1px solid #d1d5db;border-top:none;text-align:center;\">\n          <a href=\"" + HtmlEncode(batch.LoginUrl) + "\" style=\"display:inline-block;padding:14px 26px;background:#0056b3;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:700;\">View Policies</a>\n        </td>\n      </tr>");
        // sb.AppendLine("      <tr>\n        <td style=\"background:#ffffff;padding:0 24px 24px 24px;border:1px solid #d1d5db;border-top:none;color:#4b5563;font-size:14px;line-height:1.75;\">\n          <p style=\"margin:0 0 16px 0;\">This is an automated notification from the PolicyHub system. Please complete your acknowledgements before the due date.</p>\n          <p style=\"margin:0;\">Regards,<br/>Internal Notifications<br/>C2S Technologies Pvt Ltd</p>\n        </td>\n      </tr>");
        // sb.AppendLine("    </table>");
        // sb.AppendLine("  </body>");
        // sb.AppendLine("</html>");

        // return sb.ToString();
        var sb = new StringBuilder();

        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html>");
        sb.AppendLine("<body style='font-family:Segoe UI,Arial,sans-serif;background:#f5f5f5;padding:30px;'>");

        sb.AppendLine("<table style='max-width:700px;width:100%;margin:auto;background:#ffffff;border:1px solid #dcdcdc;border-collapse:collapse;'>");

        sb.AppendLine("<tr>");
        sb.AppendLine("<td style='padding:30px;'>");

        sb.AppendLine($"<p style='font-size:15px;'>Hello <strong>{HtmlEncode(batch.RecipientName)}</strong>,</p>");

        sb.AppendLine("<p style='font-size:15px;'>");
        sb.AppendLine("You have been assigned the following company policy for review and acknowledgement.");
        sb.AppendLine("</p>");

        sb.AppendLine("<p style='font-size:15px;'>");
        sb.AppendLine("Please review the policy and complete your acknowledgement before the due date.");
        sb.AppendLine("</p>");

        sb.AppendLine("<table style='width:100%;border-collapse:collapse;margin-top:20px;'>");

        sb.AppendLine("<thead>");
        sb.AppendLine("<tr style='background:#0B5CAD;color:white;'>");
        sb.AppendLine("<th style='padding:12px;border:1px solid #ddd;text-align:left;'>Policy</th>");
        sb.AppendLine("<th style='padding:12px;border:1px solid #ddd;text-align:left;'>Assigned On</th>");
        sb.AppendLine("<th style='padding:12px;border:1px solid #ddd;text-align:left;'>Due Date</th>");
        sb.AppendLine("</tr>");
        sb.AppendLine("</thead>");

        sb.AppendLine("<tbody>");

        foreach (var policy in batch.Policies)
        {
            sb.AppendLine("<tr>");
            sb.AppendLine($"<td style='padding:12px;border:1px solid #ddd;'>{HtmlEncode(policy.PolicyName)}</td>");
            sb.AppendLine($"<td style='padding:12px;border:1px solid #ddd;'>{policy.AssignedDate:dd MMM yyyy}</td>");
            sb.AppendLine($"<td style='padding:12px;border:1px solid #ddd;'>{HtmlEncode(policy.DueDate ?? "N/A")}</td>");
            sb.AppendLine("</tr>");
        }

        sb.AppendLine("</tbody>");
        sb.AppendLine("</table>");

        sb.AppendLine("<div style='text-align:center;margin:35px 0;'>");
        sb.AppendLine($"<a href='{HtmlEncode(batch.LoginUrl)}' style='background:#0B5CAD;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;'>View Policy</a>");
        sb.AppendLine("</div>");

        sb.AppendLine("<p style='font-size:14px;color:#555;'>");
        sb.AppendLine("If you have any questions regarding this policy, please contact your HR or Compliance team.");
        sb.AppendLine("</p>");

        sb.AppendLine("<br/>");

        sb.AppendLine("<p style='font-size:14px;'>");
        sb.AppendLine("Thanks & Regards,<br/>");
        sb.AppendLine("<strong>HR Team</strong>");
        sb.AppendLine("</p>");

        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");

        sb.AppendLine("</table>");
        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }

    private static string HtmlEncode(string value)
    {
        return WebUtility.HtmlEncode(value ?? string.Empty);
    }
}
