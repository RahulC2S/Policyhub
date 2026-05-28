using Microsoft.AspNetCore.Http;
using System.Security.Claims;
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
                    existing.LastLogin = System.DateTime.UtcNow;
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
}
