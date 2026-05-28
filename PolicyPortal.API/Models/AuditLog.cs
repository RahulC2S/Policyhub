using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class AuditLog
{
    public int AuditId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    public DateTime? Timestamp { get; set; }

    public string? Metadata { get; set; }

    public virtual User? User { get; set; }
}
// AuditLogs
// Categories
// Departments
// Notifications
// Policies
// PolicyAcknowledgments
// PolicyAssignments
// PolicySignatures
// PolicyVersions
// ReportExports
// Roles
// sysdiagrams
// Users