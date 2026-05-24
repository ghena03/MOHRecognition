using DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryRecognitionRequestService : IRecognitionRequestService
    {
        private static readonly List<RecognitionRequestRecord> _requests = new();
        private static int _nextId = 1;
        private static readonly object _lock = new();

        public Task<IReadOnlyList<RecognitionRequestRecord>> GetAll()
        {
            lock (_lock)
                return Task.FromResult<IReadOnlyList<RecognitionRequestRecord>>(
                    _requests.OrderByDescending(x => x.SubmittedAt).ToList());
        }

        public Task<RecognitionRequestRecord?> GetById(int id)
        {
            lock (_lock)
                return Task.FromResult(_requests.FirstOrDefault(x => x.Id == id));
        }

        public Task<RecognitionRequestRecord> Add(RecognitionRequestRecord request)
        {
            lock (_lock)
            {
                request.Id = _nextId++;
                if (string.IsNullOrWhiteSpace(request.ReferenceNumber))
                    request.ReferenceNumber = $"REQ-{DateTime.Now:yyyy}-{request.Id:D4}";
                if (request.SubmittedAt == default)
                    request.SubmittedAt = DateTime.Now;
                if (request.Year <= 0)
                    request.Year = request.SubmittedAt.Year;
                request.AssignedMember = NormalizeAssignedMember(request.AssignedMember);
                request.Status = NormalizeStatusForAssignment(request.Status, request.AssignedMember);
                _requests.Add(request);
                return Task.FromResult(request);
            }
        }

        public Task<bool> RequireAdminReview(int id, string submittedBy)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.Status = "Requires Admin Review";
                req.SubmittedToAdminBy = NormalizeAssignedMember(submittedBy);
                req.SubmittedToAdminAt = DateTime.Now;
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveInfrastructureNotes(
            int id,
            string facultiesAssessment, string hospitalsAssessment,
            string hospitalEnvironmentAssessment, string laboratoriesFacilitiesAssessment,
            string libraryAssessment, string facultiesAssessmentNote,
            string hospitalsAssessmentNote, string hospitalEnvironmentAssessmentNote,
            string laboratoriesFacilitiesAssessmentNote, string libraryAssessmentNote)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.FacultiesAssessment = NormalizeAssessmentStatus(facultiesAssessment);
                req.HospitalsAssessment = NormalizeAssessmentStatus(hospitalsAssessment);
                req.HospitalEnvironmentAssessment = NormalizeAssessmentStatus(hospitalEnvironmentAssessment);
                req.LaboratoriesFacilitiesAssessment = NormalizeAssessmentStatus(laboratoriesFacilitiesAssessment);
                req.LibraryAssessment = NormalizeAssessmentStatus(libraryAssessment);
                req.FacultiesAssessmentNote = NormalizeAssessmentNote(req.FacultiesAssessment, facultiesAssessmentNote);
                req.HospitalsAssessmentNote = NormalizeAssessmentNote(req.HospitalsAssessment, hospitalsAssessmentNote);
                req.HospitalEnvironmentAssessmentNote = NormalizeAssessmentNote(req.HospitalEnvironmentAssessment, hospitalEnvironmentAssessmentNote);
                req.LaboratoriesFacilitiesAssessmentNote = NormalizeAssessmentNote(req.LaboratoriesFacilitiesAssessment, laboratoriesFacilitiesAssessmentNote);
                req.LibraryAssessmentNote = NormalizeAssessmentNote(req.LibraryAssessment, libraryAssessmentNote);
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveAdmissionStudyDurationReview(int id, AdmissionStudyDurationReviewDto review)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.AdmissionStudyDurationReview = review ?? new AdmissionStudyDurationReviewDto();
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveGlobalRankings(int id, GlobalRankingsDto rankings)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.GlobalRankings = rankings ?? new GlobalRankingsDto();
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveBasicInfoAssessment(int id, string decision, string reason, string accreditationStatus, string accreditationNote)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.BasicInfoAssessmentDecision = (decision ?? string.Empty).Trim();
                req.BasicInfoAssessmentReason = (reason ?? string.Empty).Trim();
                req.AccreditationStatus = (accreditationStatus ?? string.Empty).Trim();
                req.AccreditationNote = (accreditationNote ?? string.Empty).Trim();
                return Task.FromResult(true);
            }
        }

        public Task<bool> UpdateStatus(int id, string status)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.Status = status;
                return Task.FromResult(true);
            }
        }

        public Task<bool> SavePublicInfoSection(int id, PublicInfoDto publicInfo, AcademicInfoDto academicInfoPatch, string city, string country)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.PublicInfo = publicInfo ?? new PublicInfoDto();
                req.City = (city ?? string.Empty).Trim();
                req.Country = (country ?? string.Empty).Trim();
                if (academicInfoPatch != null)
                {
                    req.AcademicInfo.TypeOfAcademicInstitution = academicInfoPatch.TypeOfAcademicInstitution;
                    req.AcademicInfo.TypeOfAcademicInstitutionOther = academicInfoPatch.TypeOfAcademicInstitutionOther;
                    req.AcademicInfo.CollegesCount = academicInfoPatch.CollegesCount;
                    req.AcademicInfo.CollegesNames = academicInfoPatch.CollegesNames;
                }
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveAcademicStaffSection(int id, AcademicInfoDto staffData)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null || staffData == null) return Task.FromResult(false);
                req.AcademicInfo = staffData;
                return Task.FromResult(true);
            }
        }

        public Task<bool> SaveStudyDurationSection(int id, StudyDurationDto studyDuration)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.StudyDuration = studyDuration ?? new StudyDurationDto();
                return Task.FromResult(true);
            }
        }

        public Task<bool> SetManualDataFilled(int id)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.ManualDataFilled = true;
                return Task.FromResult(true);
            }
        }

        public Task<bool> UpdateManualRequestData(int id, Action<RecognitionRequestRecord> updater)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                updater(req);
                return Task.FromResult(true);
            }
        }

        public Task<bool> AssignMember(int id, string memberName)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return Task.FromResult(false);
                req.AssignedMember = NormalizeAssignedMember(memberName);
                req.Status = NormalizeStatusForAssignment(req.Status, req.AssignedMember);
                return Task.FromResult(true);
            }
        }

        private static string NormalizeAssignedMember(string? memberName)
        {
            var value = (memberName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(value) ||
                value.Equals("unassigned", StringComparison.OrdinalIgnoreCase))
                return "Unassigned";
            return value;
        }

        private static string NormalizeStatusForAssignment(string? currentStatus, string assignedMember)
        {
            if (assignedMember == "Unassigned") return "Pending";
            if (string.Equals(currentStatus, "Requires Admin Review", StringComparison.OrdinalIgnoreCase))
                return "Requires Admin Review";
            return "Assigned";
        }

        private static string NormalizeAssessmentStatus(string? value)
        {
            var normalized = (value ?? string.Empty).Trim();
            return normalized switch
            {
                "Meets Standards"   => "Meets Standards",
                "Needs Improvement" => "Needs Improvement",
                _ => string.Empty
            };
        }

        private static string NormalizeAssessmentNote(string assessmentStatus, string? note)
        {
            if (!string.Equals(assessmentStatus, "Needs Improvement", StringComparison.Ordinal))
                return string.Empty;
            return (note ?? string.Empty).Trim();
        }
    }
}
