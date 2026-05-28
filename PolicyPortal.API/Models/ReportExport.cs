using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class ReportExport
{
    public int ReportId { get; set; }

    public int? GeneratedBy { get; set; }

    public string? FilePath { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? GeneratedByNavigation { get; set; }
}
