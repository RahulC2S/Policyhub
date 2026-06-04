using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PolicyPortal.API.Models;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Policy> Policies { get; set; }

    public virtual DbSet<PolicyAcknowledgment> PolicyAcknowledgments { get; set; }

    public virtual DbSet<PolicyAssignment> PolicyAssignments { get; set; }

    public virtual DbSet<PolicySignature> PolicySignatures { get; set; }

    public virtual DbSet<PolicyVersion> PolicyVersions { get; set; }

    public virtual DbSet<ReportExport> ReportExports { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-NDMQR1E;Database=policyhub;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditId).HasName("PK__AuditLog__A17F2398BD709E5C");

            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Audit_User");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A0B44D65D95");

            entity.HasIndex(e => e.CategoryName, "UQ__Categori__8517B2E0F224CEB3").IsUnique();

            entity.Property(e => e.CategoryName).HasMaxLength(100);
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.DepartmentId).HasName("PK__Departme__B2079BED52E114A3");

            entity.HasIndex(e => e.DepartmentName, "UQ__Departme__D949CC34EE78AD1A").IsUnique();

            entity.Property(e => e.DepartmentName).HasMaxLength(150);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E123D654C10");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Message).HasMaxLength(500);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notification_User");
        });

        modelBuilder.Entity<Policy>(entity =>
        {
            entity.HasKey(e => e.PolicyId).HasName("PK__Policies__2E1339A4121519A1");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.Category).WithMany(p => p.Policies)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Policies_Category");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Policies)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_Policies_User");
        });

        modelBuilder.Entity<PolicyAcknowledgment>(entity =>
        {
            entity.HasKey(e => e.AcknowledgmentId).HasName("PK__PolicyAc__9342B48A95A9F4D1");

            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Assignment).WithMany(p => p.PolicyAcknowledgments)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ack_Assignment");

            entity.HasOne(d => d.User).WithMany(p => p.PolicyAcknowledgments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ack_User");
        });

        modelBuilder.Entity<PolicyAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__PolicyAs__32499E773D21CCFD");

            entity.Property(e => e.AssignedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsMandatory).HasDefaultValue(true);

            entity.HasOne(d => d.AssignedToDepartment).WithMany(p => p.PolicyAssignments)
                .HasForeignKey(d => d.AssignedToDepartmentId)
                .HasConstraintName("FK_Assign_Department");

            entity.HasOne(d => d.AssignedToUser).WithMany(p => p.PolicyAssignments)
                .HasForeignKey(d => d.AssignedToUserId)
                .HasConstraintName("FK_Assign_User");

            entity.HasOne(d => d.Policy).WithMany(p => p.PolicyAssignments)
                .HasForeignKey(d => d.PolicyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Assign_Policy");

            entity.HasOne(d => d.Version).WithMany(p => p.PolicyAssignments)
                .HasForeignKey(d => d.VersionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Assign_Version");
        });

        modelBuilder.Entity<PolicySignature>(entity =>
        {
            entity.HasKey(e => e.SignatureId).HasName("PK__PolicySi__3DCA57A99E3581AA");

            entity.Property(e => e.Ipaddress)
                .HasMaxLength(50)
                .HasColumnName("IPAddress");
            entity.Property(e => e.SignatureHash).HasMaxLength(500);
            entity.Property(e => e.SignedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UserAgent).HasMaxLength(255);

            entity.HasOne(d => d.Acknowledgment).WithMany(p => p.PolicySignatures)
                .HasForeignKey(d => d.AcknowledgmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sign_Ack");

            entity.HasOne(d => d.SignedByNavigation).WithMany(p => p.PolicySignatures)
                .HasForeignKey(d => d.SignedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sign_User");
        });

        modelBuilder.Entity<PolicyVersion>(entity =>
        {
            entity.HasKey(e => e.VersionId).HasName("PK__PolicyVe__16C6400F621CBFDE");

            entity.HasIndex(e => new { e.PolicyId, e.VersionNumber }, "UQ_Policy_Version").IsUnique();

            entity.Property(e => e.BlobUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.VersionNumber).HasMaxLength(20);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.PolicyVersions)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_Versions_User");

            entity.HasOne(d => d.Policy).WithMany(p => p.PolicyVersions)
                .HasForeignKey(d => d.PolicyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Versions_Policy");
        });

        modelBuilder.Entity<ReportExport>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__ReportEx__D5BD4805E0EE2C33");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FilePath).HasMaxLength(255);

            entity.HasOne(d => d.GeneratedByNavigation).WithMany(p => p.ReportExports)
                .HasForeignKey(d => d.GeneratedBy)
                .HasConstraintName("FK_Report_User");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A4351B01C");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B616025AAA37C").IsUnique();

            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C65FDFD63");


            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053428CA2F81").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Department).WithMany(p => p.Users)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("FK_Users_Department");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_Users_Role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
