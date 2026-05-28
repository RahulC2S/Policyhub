using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class PolicyAssignment
{
    public int AssignmentId { get; set; }

    public int PolicyId { get; set; }

    public int VersionId { get; set; }

    public int? AssignedToUserId { get; set; }

    public int? AssignedToDepartmentId { get; set; }

    public DateTime? AssignedDate { get; set; }

    public DateOnly? DueDate { get; set; }

    public bool? IsMandatory { get; set; }

    public virtual Department? AssignedToDepartment { get; set; }

    public virtual User? AssignedToUser { get; set; }

    public virtual Policy Policy { get; set; } = null!;

    public virtual ICollection<PolicyAcknowledgment> PolicyAcknowledgments { get; set; } = new List<PolicyAcknowledgment>();

    public virtual PolicyVersion Version { get; set; } = null!;
}
