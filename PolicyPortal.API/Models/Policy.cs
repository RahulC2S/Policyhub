using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class Policy
{
    public int PolicyId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public int? CategoryId { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }
    
    public string? BlobPath { get; set; }

    public virtual Category? Category { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<PolicyAssignment> PolicyAssignments { get; set; } = new List<PolicyAssignment>();

    public virtual ICollection<PolicyVersion> PolicyVersions { get; set; } = new List<PolicyVersion>();
}
