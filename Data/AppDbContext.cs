using DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MOHRecognition.DTOs;
using MOHRecognition.Services;
using System.Text.Json;

namespace MOHRecognition.Data;

public sealed class AppDbContext : DbContext
{
    // ── Shared serialiser options ──────────────────────────────────────────────
    internal static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy        = null,
        WriteIndented               = false,
        DefaultIgnoreCondition      = System.Text.Json.Serialization.JsonIgnoreCondition.Never,
    };

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── DbSets ─────────────────────────────────────────────────────────────────
    public DbSet<RecognitionRequestRecord> RecognitionRequests => Set<RecognitionRequestRecord>();
    public DbSet<AdvisorDto>               Advisors            => Set<AdvisorDto>();
    public DbSet<EmployeeDto>              Employees           => Set<EmployeeDto>();
    public DbSet<MeetingDto>               Meetings            => Set<MeetingDto>();
    public DbSet<MeetingDecisionDto>       MeetingDecisions    => Set<MeetingDecisionDto>();
    public DbSet<MeetingAttendanceRecord>  MeetingAttendances  => Set<MeetingAttendanceRecord>();

    // ── Model configuration ────────────────────────────────────────────────────
    protected override void OnModelCreating(ModelBuilder mb)
    {
        ConfigureRecognitionRequests(mb);
        ConfigureAdvisors(mb);
        ConfigureEmployees(mb);
        ConfigureMeetings(mb);
        ConfigureMeetingDecisions(mb);
        ConfigureMeetingAttendances(mb);
    }

    // ── RecognitionRequests ────────────────────────────────────────────────────
    private static void ConfigureRecognitionRequests(ModelBuilder mb)
    {
        mb.Entity<RecognitionRequestRecord>(e =>
        {
            e.ToTable("RecognitionRequests");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();

            // Bounded-length columns
            e.Property(x => x.ReferenceNumber).HasMaxLength(50);
            e.Property(x => x.Status).HasMaxLength(100);
            e.Property(x => x.ApplicationType).HasMaxLength(50);
            e.Property(x => x.AssignedMember).HasMaxLength(500);
            e.Property(x => x.UniversityName).HasMaxLength(500);
            e.Property(x => x.Country).HasMaxLength(200);
            e.Property(x => x.City).HasMaxLength(200);
            e.Property(x => x.ApplicantEmail).HasMaxLength(500);
            e.Property(x => x.UniversityEmail).HasMaxLength(500);
            e.Property(x => x.InstitutionType).HasMaxLength(100);
            e.Property(x => x.RecognitionType).HasMaxLength(100);

            // High-traffic query indexes
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.AssignedMember);
            e.HasIndex(x => x.ApplicationType);
            e.HasIndex(x => x.SubmittedAt);
            e.HasIndex(x => x.IsManual);
            e.HasIndex(x => x.Year);
            e.HasIndex(x => x.ReferenceNumber).IsUnique();

            // ── JSON columns for all complex nested DTOs ───────────────────────
            e.Property(x => x.PublicInfo)
             .HasColumnName("PublicInfoJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<PublicInfoDto>())
             .Metadata.SetValueComparer(JsonComparer<PublicInfoDto>());

            e.Property(x => x.AcademicInfo)
             .HasColumnName("AcademicInfoJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<AcademicInfoDto>())
             .Metadata.SetValueComparer(JsonComparer<AcademicInfoDto>());

            e.Property(x => x.SubmitApplication)
             .HasColumnName("SubmitApplicationJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<SubmitApplicationDto>())
             .Metadata.SetValueComparer(JsonComparer<SubmitApplicationDto>());

            e.Property(x => x.AdmissionRequirements)
             .HasColumnName("AdmissionRequirementsJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<AdmissionRequirementsDto>())
             .Metadata.SetValueComparer(JsonComparer<AdmissionRequirementsDto>());

            e.Property(x => x.StudyDuration)
             .HasColumnName("StudyDurationJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<StudyDurationDto>())
             .Metadata.SetValueComparer(JsonComparer<StudyDurationDto>());

            e.Property(x => x.MedicineDentistry)
             .HasColumnName("MedicineDentistryJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<MedicineDentistryDto>())
             .Metadata.SetValueComparer(JsonComparer<MedicineDentistryDto>());

            e.Property(x => x.AdmissionStudyDurationReview)
             .HasColumnName("AdmissionStudyDurationReviewJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<AdmissionStudyDurationReviewDto>())
             .Metadata.SetValueComparer(JsonComparer<AdmissionStudyDurationReviewDto>());

            e.Property(x => x.GlobalRankings)
             .HasColumnName("GlobalRankingsJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<GlobalRankingsDto>())
             .Metadata.SetValueComparer(JsonComparer<GlobalRankingsDto>());

            e.Property(x => x.Attachments)
             .HasColumnName("AttachmentsJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<AttachmentDto>())
             .Metadata.SetValueComparer(JsonComparer<AttachmentDto>());

            e.Property(x => x.Pictures)
             .HasColumnName("PicturesJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<PicturesDto>())
             .Metadata.SetValueComparer(JsonComparer<PicturesDto>());

            e.Property(x => x.Laboratories)
             .HasColumnName("LaboratoriesJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<LaboratoriesDto>())
             .Metadata.SetValueComparer(JsonComparer<LaboratoriesDto>());

            e.Property(x => x.Infrastructure)
             .HasColumnName("InfrastructureJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<InfrastructureDto>())
             .Metadata.SetValueComparer(JsonComparer<InfrastructureDto>());

            e.Property(x => x.Hospitals)
             .HasColumnName("HospitalsJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<HospitalsDto>())
             .Metadata.SetValueComparer(JsonComparer<HospitalsDto>());

            e.Property(x => x.Library)
             .HasColumnName("LibraryJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<LibraryDto>())
             .Metadata.SetValueComparer(JsonComparer<LibraryDto>());

            e.Property(x => x.UniRecAcc)
             .HasColumnName("UniRecAccJson")
             .HasColumnType("TEXT")
             .HasConversion(Json<UniRecAccDto>())
             .Metadata.SetValueComparer(JsonComparer<UniRecAccDto>());

            e.Property(x => x.AdditionalFiles)
             .HasColumnName("AdditionalFilesJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<AdditionalFileDto>())
             .Metadata.SetValueComparer(JsonComparer<List<AdditionalFileDto>>());

            // Collections stored as JSON arrays
            e.Property(x => x.Faculties)
             .HasColumnName("FacultiesJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<FacultyRowDto>())
             .Metadata.SetValueComparer(JsonComparer<List<FacultyRowDto>>());

            e.Property(x => x.Programs)
             .HasColumnName("ProgramsJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<ProgramRowDto>())
             .Metadata.SetValueComparer(JsonComparer<List<ProgramRowDto>>());

            e.Property(x => x.ProgramHours)
             .HasColumnName("ProgramHoursJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<ProgramHoursRowDto>())
             .Metadata.SetValueComparer(JsonComparer<List<ProgramHoursRowDto>>());

            e.Property(x => x.StudyPlanComplianceRows)
             .HasColumnName("StudyPlanComplianceJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<StudyPlanComplianceRowDto>())
             .Metadata.SetValueComparer(JsonComparer<List<StudyPlanComplianceRowDto>>());

            e.Property(x => x.AccreditationBodies)
             .HasColumnName("AccreditationBodiesJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<AccreditationBodyRowDto>())
             .Metadata.SetValueComparer(JsonComparer<List<AccreditationBodyRowDto>>());
        });
    }

    // ── Advisors ───────────────────────────────────────────────────────────────
    private static void ConfigureAdvisors(ModelBuilder mb)
    {
        mb.Entity<AdvisorDto>(e =>
        {
            e.ToTable("Advisors");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.Email).HasMaxLength(500);
            e.Property(x => x.FullName).HasMaxLength(300);
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.Type);
        });
    }

    // ── Employees ──────────────────────────────────────────────────────────────
    private static void ConfigureEmployees(ModelBuilder mb)
    {
        mb.Entity<EmployeeDto>(e =>
        {
            e.ToTable("Employees");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.Name).HasMaxLength(300);
            e.Property(x => x.Email).HasMaxLength(500);
            e.Property(x => x.Workplace).HasMaxLength(300);
        });
    }

    // ── Meetings ───────────────────────────────────────────────────────────────
    private static void ConfigureMeetings(ModelBuilder mb)
    {
        mb.Entity<MeetingDto>(e =>
        {
            e.ToTable("Meetings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.MeetingTitle).HasMaxLength(500);
            e.Property(x => x.Status).HasMaxLength(50);
            e.Property(x => x.MeetingTime).HasMaxLength(20);
            e.Property(x => x.LocationOrPlatform).HasMaxLength(500);
            e.HasIndex(x => x.SessionNumber);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.MeetingDate);

            // RequestIds stored as a JSON array of ints
            e.Property(x => x.RequestIds)
             .HasColumnName("RequestIdsJson")
             .HasColumnType("TEXT")
             .HasConversion(JsonList<int>())
             .Metadata.SetValueComparer(JsonComparer<List<int>>());
        });
    }

    // ── MeetingDecisions ───────────────────────────────────────────────────────
    private static void ConfigureMeetingDecisions(ModelBuilder mb)
    {
        mb.Entity<MeetingDecisionDto>(e =>
        {
            e.ToTable("MeetingDecisions");
            e.HasKey(x => new { x.MeetingId, x.RequestId });
            e.Property(x => x.Decision).HasMaxLength(100);
            e.HasIndex(x => x.MeetingId);
            e.HasIndex(x => x.RequestId);
            e.HasIndex(x => x.Decision);
        });
    }

    // ── MeetingAttendances ─────────────────────────────────────────────────────
    private static void ConfigureMeetingAttendances(ModelBuilder mb)
    {
        mb.Entity<MeetingAttendanceRecord>(e =>
        {
            e.ToTable("MeetingAttendances");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.HasIndex(x => new { x.MeetingId, x.EmployeeId }).IsUnique();
            e.HasIndex(x => x.MeetingId);
        });
    }

    // ── Value-converter helpers ────────────────────────────────────────────────

    private static ValueConverter<T, string> Json<T>() where T : new() =>
        new(
            v  => JsonSerializer.Serialize(v,  JsonOpts),
            s  => JsonSerializer.Deserialize<T>(s, JsonOpts) ?? new T()
        );

    private static ValueConverter<List<T>, string> JsonList<T>() =>
        new(
            v  => JsonSerializer.Serialize(v ?? new List<T>(), JsonOpts),
            s  => JsonSerializer.Deserialize<List<T>>(s, JsonOpts) ?? new List<T>()
        );

    private static ValueComparer<T> JsonComparer<T>() =>
        new(
            (a, b) => JsonSerializer.Serialize(a, JsonOpts) == JsonSerializer.Serialize(b, JsonOpts),
            c      => c == null ? 0 : JsonSerializer.Serialize(c, JsonOpts).GetHashCode(),
            c      => JsonSerializer.Deserialize<T>(JsonSerializer.Serialize(c, JsonOpts), JsonOpts)!
        );
}
