using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class PolicyAcknowledgment
{
    public int AcknowledgmentId { get; set; }

    public int AssignmentId { get; set; }

    public int UserId { get; set; }

    public string? Status { get; set; }

    public DateTime? SignedAt { get; set; }

    public string? ConsentText { get; set; }

    public virtual PolicyAssignment Assignment { get; set; } = null!;

    public virtual ICollection<PolicySignature> PolicySignatures { get; set; } = new List<PolicySignature>();

    public virtual User User { get; set; } = null!;
}
