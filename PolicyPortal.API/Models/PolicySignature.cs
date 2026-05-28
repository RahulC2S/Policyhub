using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class PolicySignature
{
    public int SignatureId { get; set; }

    public int AcknowledgmentId { get; set; }

    public int SignedBy { get; set; }

    public DateTime? SignedAt { get; set; }

    public string? Ipaddress { get; set; }

    public string? UserAgent { get; set; }

    public string? SignatureHash { get; set; }

    public virtual PolicyAcknowledgment Acknowledgment { get; set; } = null!;

    public virtual User SignedByNavigation { get; set; } = null!;
}
