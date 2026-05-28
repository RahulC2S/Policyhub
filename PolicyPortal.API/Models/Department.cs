using System;
using System.Collections.Generic;

namespace PolicyPortal.API.Models;

public partial class Department
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = null!;

    public virtual ICollection<PolicyAssignment> PolicyAssignments { get; set; } = new List<PolicyAssignment>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
