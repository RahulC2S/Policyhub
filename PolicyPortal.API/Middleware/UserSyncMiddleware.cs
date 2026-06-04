using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using PolicyPortal.API.Models;
using System.Linq;

namespace PolicyPortal.API.Middleware;

public class UserSyncMiddleware
{
    private readonly RequestDelegate _next;

    public UserSyncMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
    {
        var user = context.User;
        if (user?.Identity != null && user.Identity.IsAuthenticated)
        {
            // Try to read Azure AD object id and email
            var oid = user.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
                ?? user.FindFirst("oid")?.Value;

            var email = user.FindFirst(ClaimTypes.Upn)?.Value
                ?? user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("preferred_username")?.Value;

            var name = user.FindFirst("name")?.Value ?? user.Identity.Name ?? email;

            var roleNames = GetRoleNames(user);
            var normalizedRoleNames = roleNames.Select(r => r.ToLowerInvariant()).ToList();
            var matchedRole = normalizedRoleNames.Count > 0
                ? db.Roles.FirstOrDefault(r => normalizedRoleNames.Contains(r.RoleName.ToLower()))
                : null;

            if (!string.IsNullOrEmpty(email))
            {
                // upsert user
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
                }
                else
                {
                    existing.AzureObjectId = existing.AzureObjectId ?? oid;
                    existing.FullName = name ?? existing.FullName;
                    existing.Email = !string.IsNullOrWhiteSpace(email) ? email : existing.Email;
                    existing.LastLogin = System.DateTime.UtcNow;
                    existing.RoleId = matchedRole?.RoleId ?? existing.RoleId;
                }

                try
                {
                    await db.SaveChangesAsync();
                }
                catch
                {
                    // swallow errors to avoid breaking requests
                }
            }
        }

        await _next(context);
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
