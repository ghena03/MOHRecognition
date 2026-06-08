using DTOs;
using Microsoft.EntityFrameworkCore;
using MOHRecognition.Data;
using MOHRecognition.DTOs;
using MOHRecognition.Services;

namespace MOHRecognition.Services;

public sealed class DatabaseRecognitionRequestService : IRecognitionRequestService
{
    private readonly AppDbContext _db;

    public DatabaseRecognitionRequestService(AppDbContext db) => _db = db;

    // ── Read ───────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<RecognitionRequestRecord>> GetAll()
    {
        try
        {
            return await _db.RecognitionRequests
                             .AsNoTracking()
                             .OrderByDescending(x => x.SubmittedAt)
                             .ToListAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] GetAll failed: {ex.Message}");
            return Array.Empty<RecognitionRequestRecord>();
        }
    }

    public async Task<RecognitionRequestRecord?> GetById(int id)
    {
        try
        {
            return await _db.RecognitionRequests.FirstOrDefaultAsync(x => x.Id == id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] GetById({id}) failed: {ex.Message}");
            return null;
        }
    }

    // ── Write ──────────────────────────────────────────────────────────────────

    public async Task<RecognitionRequestRecord> Add(RecognitionRequestRecord request)
    {
        try
        {
            if (request.SubmittedAt == default)
                request.SubmittedAt = DateTime.Now;

            if (request.Year <= 0)
                request.Year = request.SubmittedAt.Year;

            request.AssignedMember = NormalizeAssignedMember(request.AssignedMember);
            request.Status         = NormalizeStatusForAssignment(request.Status, request.AssignedMember);

            request.Id = 0;
            _db.RecognitionRequests.Add(request);
            await _db.SaveChangesAsync();

            if (string.IsNullOrWhiteSpace(request.ReferenceNumber))
            {
                if (string.Equals(request.UniversityName, "Draft", StringComparison.OrdinalIgnoreCase))
                {
                    request.ReferenceNumber = $"DRAFT-{request.Id}";
                }
                else
                {
                    // Count only real (non-draft) records so reference numbers are gapless
                    var realCount = await _db.RecognitionRequests
                        .CountAsync(r => r.UniversityName.ToLower() != "draft");
                    request.ReferenceNumber = $"REQ-{request.SubmittedAt:yyyy}-{realCount:D4}";
                }
                await _db.SaveChangesAsync();
            }

            return request;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] Add failed: {ex.Message}");
            // Return the record with a temporary ID so the app flow continues
            if (request.Id <= 0) request.Id = Math.Abs(Guid.NewGuid().GetHashCode());
            if (string.IsNullOrWhiteSpace(request.ReferenceNumber))
                request.ReferenceNumber = $"REQ-{DateTime.Now:yyyy}-{request.Id:D4}";
            return request;
        }
    }

    public async Task<bool> RequireAdminReview(int id, string submittedBy)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.Status             = "Requires Admin Review";
            req.SubmittedToAdminBy = NormalizeAssignedMember(submittedBy);
            req.SubmittedToAdminAt = DateTime.Now;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] RequireAdminReview({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> AssignMember(int id, string memberName)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.AssignedMember = NormalizeAssignedMember(memberName);
            req.Status         = NormalizeStatusForAssignment(req.Status, req.AssignedMember);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] AssignMember({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateStatus(int id, string status)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.Status = status?.Trim() ?? req.Status;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] UpdateStatus({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveInfrastructureNotes(
        int id,
        string facultiesAssessment,
        string hospitalsAssessment,
        string hospitalEnvironmentAssessment,
        string laboratoriesFacilitiesAssessment,
        string libraryAssessment,
        string facultiesAssessmentNote,
        string hospitalsAssessmentNote,
        string hospitalEnvironmentAssessmentNote,
        string laboratoriesFacilitiesAssessmentNote,
        string libraryAssessmentNote)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.FacultiesAssessment                  = NormalizeAssessmentStatus(facultiesAssessment);
            req.HospitalsAssessment                  = NormalizeAssessmentStatus(hospitalsAssessment);
            req.HospitalEnvironmentAssessment        = NormalizeAssessmentStatus(hospitalEnvironmentAssessment);
            req.LaboratoriesFacilitiesAssessment     = NormalizeAssessmentStatus(laboratoriesFacilitiesAssessment);
            req.LibraryAssessment                    = NormalizeAssessmentStatus(libraryAssessment);
            req.FacultiesAssessmentNote              = NormalizeAssessmentNote(req.FacultiesAssessment, facultiesAssessmentNote);
            req.HospitalsAssessmentNote              = NormalizeAssessmentNote(req.HospitalsAssessment, hospitalsAssessmentNote);
            req.HospitalEnvironmentAssessmentNote    = NormalizeAssessmentNote(req.HospitalEnvironmentAssessment, hospitalEnvironmentAssessmentNote);
            req.LaboratoriesFacilitiesAssessmentNote = NormalizeAssessmentNote(req.LaboratoriesFacilitiesAssessment, laboratoriesFacilitiesAssessmentNote);
            req.LibraryAssessmentNote                = NormalizeAssessmentNote(req.LibraryAssessment, libraryAssessmentNote);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveInfrastructureNotes({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveAdmissionStudyDurationReview(int id, AdmissionStudyDurationReviewDto review)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.AdmissionStudyDurationReview = review ?? new AdmissionStudyDurationReviewDto();
            _db.Entry(req).Property(x => x.AdmissionStudyDurationReview).IsModified = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveAdmissionStudyDurationReview({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveGlobalRankings(int id, GlobalRankingsDto rankings)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.GlobalRankings = rankings ?? new GlobalRankingsDto();
            _db.Entry(req).Property(x => x.GlobalRankings).IsModified = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveGlobalRankings({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveBasicInfoAssessment(int id, string decision, string reason, string accreditationStatus, string accreditationNote)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.BasicInfoAssessmentDecision = decision?.Trim() ?? "";
            req.BasicInfoAssessmentReason   = reason?.Trim()   ?? "";
            req.AccreditationStatus         = accreditationStatus?.Trim() ?? "";
            req.AccreditationNote           = accreditationNote?.Trim()   ?? "";
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveBasicInfoAssessment({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveCommitteeFinalDecision(int id, string decision, string recommendation)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;
            req.CommitteeFinalDecision       = decision?.Trim()       ?? "";
            req.CommitteeFinalRecommendation = recommendation?.Trim() ?? "";
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveCommitteeFinalDecision({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SavePublicInfoSection(int id, PublicInfoDto publicInfo, AcademicInfoDto academicInfoPatch, string city, string country)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.PublicInfo = publicInfo ?? new PublicInfoDto();

            if (academicInfoPatch is not null)
            {
                req.AcademicInfo.TypeOfAcademicInstitution      = academicInfoPatch.TypeOfAcademicInstitution;
                req.AcademicInfo.TypeOfAcademicInstitutionOther = academicInfoPatch.TypeOfAcademicInstitutionOther;
                req.AcademicInfo.CollegesCount                  = academicInfoPatch.CollegesCount;
                req.AcademicInfo.CollegesNames                  = academicInfoPatch.CollegesNames;
            }

            if (!string.IsNullOrWhiteSpace(city))    req.City    = city.Trim();
            if (!string.IsNullOrWhiteSpace(country)) req.Country = country.Trim();

            _db.Entry(req).Property(x => x.PublicInfo).IsModified   = true;
            _db.Entry(req).Property(x => x.AcademicInfo).IsModified = true;
            _db.Entry(req).Property(x => x.City).IsModified         = true;
            _db.Entry(req).Property(x => x.Country).IsModified      = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SavePublicInfoSection({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveAcademicStaffSection(int id, AcademicInfoDto staffData)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.AcademicInfo = staffData ?? new AcademicInfoDto();
            _db.Entry(req).Property(x => x.AcademicInfo).IsModified = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveAcademicStaffSection({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SaveStudyDurationSection(int id, StudyDurationDto studyDuration)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.StudyDuration = studyDuration ?? new StudyDurationDto();
            _db.Entry(req).Property(x => x.StudyDuration).IsModified = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SaveStudyDurationSection({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SetManualDataFilled(int id)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            req.ManualDataFilled = true;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] SetManualDataFilled({id}) failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateManualRequestData(int id, Action<RecognitionRequestRecord> updater)
    {
        try
        {
            var req = await _db.RecognitionRequests.FindAsync(id);
            if (req is null) return false;

            updater(req);
            _db.Entry(req).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] UpdateManualRequestData({id}) failed: {ex.Message}");
            return false;
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string NormalizeAssignedMember(string? memberName)
    {
        var value = (memberName ?? "").Trim();
        return string.IsNullOrWhiteSpace(value) ||
               value.Equals("unassigned", StringComparison.OrdinalIgnoreCase)
            ? "Unassigned"
            : value;
    }

    private static string NormalizeStatusForAssignment(string? currentStatus, string assignedMember)
    {
        var isUnassigned = string.IsNullOrWhiteSpace(assignedMember) ||
                           assignedMember.Equals("Unassigned", StringComparison.OrdinalIgnoreCase);
        if (isUnassigned) return "Pending";
        if (string.IsNullOrWhiteSpace(currentStatus) || currentStatus == "Pending") return "Assigned";
        return currentStatus;
    }

    private static string NormalizeAssessmentStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "";
        return value.Trim() switch
        {
            "Meets Standards"   => "Meets Standards",
            "Needs Improvement" => "Needs Improvement",
            _                   => value.Trim()
        };
    }

    private static string NormalizeAssessmentNote(string assessmentStatus, string? note)
    {
        if (string.IsNullOrWhiteSpace(assessmentStatus)) return "";
        return note?.Trim() ?? "";
    }
}
