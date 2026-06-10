// using Microsoft.OpenApi.Models;
// using Microsoft.EntityFrameworkCore;
// using PolicyPortal.API.Models;
// using PolicyPortal.API.Interfaces;
// using PolicyPortal.API.Repositories;
// using PolicyPortal.API.Services;
// builder.Services.AddScoped<IPolicyRepository, PolicyRepository>();
// builder.Services.AddScoped<IPolicyService, PolicyService>();
// var builder = WebApplication.CreateBuilder(args);

// // Add services
// builder.Services.AddControllers();

// builder.Services.AddEndpointsApiExplorer();

// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo
//     {
//         Title = "Policy Portal API",
//         Version = "v1"
//     });
// });

// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowReact",
//         policy =>
//         {
//             policy.AllowAnyOrigin()
//                   .AllowAnyHeader()
//                   .AllowAnyMethod();
//         });
// });

// // ADD THIS HERE
// builder.Services.AddDbContext<ApplicationDbContext>(options =>
//     options.UseSqlServer(
//         builder.Configuration.GetConnectionString("DefaultConnection")));

// var app = builder.Build();

// // Configure middleware
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();

//     app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();

// app.UseCors("AllowReact");

// app.UseAuthorization();

// app.MapControllers();

// app.Run();
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PolicyPortal.API.Models;
using PolicyPortal.API.Interfaces;
using PolicyPortal.API.Repositories;
using System.Text.Json.Serialization;
using PolicyPortal.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using PolicyPortal.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

//
// ✅ Controllers + Fix Circular JSON Reference
//
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

//
// ✅ Swagger
//
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Policy Portal API",
        Version = "v1"
    });
    
    // Allow multiple operation ids
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
});

//
// ✅ CORS (React Frontend)
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// ✅ Microsoft Entra ID (Azure AD) authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Ensure roles claim is mapped from the raw access token
builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters.RoleClaimType = "roles";
    options.TokenValidationParameters.NameClaimType = "name";
});

// Authorization policies for RBAC
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireEmployee", policy => policy.RequireRole("Employee", "HRAdmin", "SuperAdmin"));
    options.AddPolicy("RequireHRAdmin", policy => policy.RequireRole("HRAdmin", "SuperAdmin"));
    options.AddPolicy("RequireAuditor", policy => policy.RequireRole("Auditor", "SuperAdmin"));
});

//
// ✅ SQL Server DB Context
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

//
// ✅ Dependency Injection
//
builder.Services.AddScoped<IPolicyRepository, PolicyRepository>();
builder.Services.AddScoped<BlobService>();
// builder.Services.AddScoped<UserSyncMiddleware>();

var app = builder.Build();

//
// ✅ Middleware
//
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// ✅ Enable CORS
app.UseCors("AllowReact");

// ✅ Authentication + Authorization middleware
app.UseAuthentication();
 app.UseMiddleware<UserSyncMiddleware>();
app.UseAuthorization();

// ✅ Map Controllers
app.MapControllers();

app.Run();