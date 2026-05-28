using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? EmployeeId { get; set; }

    public string FullName { get; set; } = null!;

    public string? AzureObjectId { get; set; }

    public string Email { get; set; } = null!;

    public int? DepartmentId { get; set; }

    public int? RoleId { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? LastLogin { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual Department? Department { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Policy> Policies { get; set; } = new List<Policy>();

    public virtual ICollection<PolicyAcknowledgment> PolicyAcknowledgments { get; set; } = new List<PolicyAcknowledgment>();

    public virtual ICollection<PolicyAssignment> PolicyAssignments { get; set; } = new List<PolicyAssignment>();

    public virtual ICollection<PolicySignature> PolicySignatures { get; set; } = new List<PolicySignature>();

    public virtual ICollection<PolicyVersion> PolicyVersions { get; set; } = new List<PolicyVersion>();

    public virtual ICollection<ReportExport> ReportExports { get; set; } = new List<ReportExport>();

    public virtual Role? Role { get; set; }
}
