using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class PolicyVersion
{
    public int VersionId { get; set; }

    public int PolicyId { get; set; }

    public string VersionNumber { get; set; } = null!;

    public DateOnly? EffectiveDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public string BlobUrl { get; set; } = null!;

    public string? FileName { get; set; }

    public string? FileType { get; set; }

    public long? FileSize { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Policy Policy { get; set; } = null!;

    public virtual ICollection<PolicyAssignment> PolicyAssignments { get; set; } = new List<PolicyAssignment>();
}
