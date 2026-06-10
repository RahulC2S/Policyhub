using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using PolicyPortal.API.Models;
using System.Linq;

namespace PolicyPortal.API.Middleware;

public class UserSyncMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserSyncMiddleware> _logger;

    public UserSyncMiddleware(RequestDelegate next, ILogger<UserSyncMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
    {
        var user = context.User;
        if (user?.Identity != null && user.Identity.IsAuthenticated)
        {
            var oid = GetClaimValue(user,
                "http://schemas.microsoft.com/identity/claims/objectidentifier",
                "oid",
                ClaimTypes.NameIdentifier);

            var email = GetClaimValue(user,
                "upn",
                "unique_name",
                ClaimTypes.Upn,
                ClaimTypes.Email,
                "email",
                "preferred_username",
                "preferredUsername");

            var name = GetClaimValue(user, "name") ?? user.Identity.Name ?? email;

            _logger.LogDebug("UserSyncMiddleware invoked. oid={Oid}, email={Email}, name={Name}, isAuthenticated={IsAuthenticated}",
                oid,
                email,
                name,
                user.Identity.IsAuthenticated);

            var roleNames = GetRoleNames(user);
            var normalizedRoleNames = roleNames.Select(r => r.ToLowerInvariant()).ToList();
            var matchedRole = normalizedRoleNames.Count > 0
                ? db.Roles.FirstOrDefault(r => normalizedRoleNames.Contains(r.RoleName.ToLower()))
                : null;

            if (!string.IsNullOrEmpty(email))
            {
                var existing = db.Users.FirstOrDefault(u => u.AzureObjectId == oid || u.Email.ToLower() == email.ToLower());
                if (existing == null)
                {
                    existing = new User
                    {
                        AzureObjectId = oid,
                        FullName = name ?? email,
                        Email = email,
                        RoleId = matchedRole?.RoleId,
                        IsActive = true,
                        CreatedAt = System.DateTime.UtcNow,
                        LastLogin = System.DateTime.UtcNow
                    };
                    db.Users.Add(existing);
                    _logger.LogInformation("UserSyncMiddleware creating new user. email={Email}, oid={Oid}", email, oid);
                }
                else
                {
                    existing.AzureObjectId = existing.AzureObjectId ?? oid;
                    existing.FullName = name ?? existing.FullName;
                    existing.Email = !string.IsNullOrWhiteSpace(email) ? email : existing.Email;
                    existing.LastLogin = System.DateTime.UtcNow;
                    existing.RoleId = matchedRole?.RoleId ?? existing.RoleId;
                    _logger.LogInformation("UserSyncMiddleware updating existing user. userId={UserId}, email={Email}, oid={Oid}", existing.UserId, email, oid);
                }

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to sync Azure AD user to database. oid={Oid}, email={Email}", oid, email);
                }
            }
            else
            {
                _logger.LogWarning("UserSyncMiddleware skipped sync because email was missing. oid={Oid}, claims={Claims}",
                    oid,
                    string.Join(", ", user.Claims.Select(c => c.Type + "=" + c.Value)));
            }
        }

        await _next(context);
    }

    private static string? GetClaimValue(ClaimsPrincipal user, params string[] claimTypes)
    {
        foreach (var claimType in claimTypes)
        {
            var claim = user.FindFirst(claimType);
            if (!string.IsNullOrWhiteSpace(claim?.Value))
            {
                return claim.Value;
            }
        }

        return null;
    }

    private static List<string> GetRoleNames(ClaimsPrincipal user)
    {
        var roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        if (!roles.Any())
        {
            roles = user.FindAll("roles").Select(c => c.Value).ToList();
        }

        if (!roles.Any())
        {
            roles = user.FindAll("role").Select(c => c.Value).ToList();
        }

        var normalizedRoles = new List<string>();
        foreach (var roleValue in roles)
        {
            if (string.IsNullOrWhiteSpace(roleValue))
            {
                continue;
            }

            if (roleValue.StartsWith("[") && roleValue.EndsWith("]"))
            {
                try
                {
                    var parsedRoles = JsonSerializer.Deserialize<List<string>>(roleValue);
                    if (parsedRoles != null)
                    {
                        normalizedRoles.AddRange(parsedRoles.Where(r => !string.IsNullOrWhiteSpace(r)).Select(r => r.Trim()));
                        continue;
                    }
                }
                catch
                {
                    // ignore bad JSON and fall back to raw value
                }
            }

            if (roleValue.Contains(","))
            {
                normalizedRoles.AddRange(roleValue.Split(',').Select(r => r.Trim()).Where(r => !string.IsNullOrWhiteSpace(r)));
                continue;
            }

            normalizedRoles.Add(roleValue.Trim());
        }

        return normalizedRoles.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }
}
