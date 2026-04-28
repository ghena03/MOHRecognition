using DTOs;

namespace MOHRecognition.Services
{
    public class InMemoryRecognitionRequestService : IRecognitionRequestService
    {
        private static readonly List<RecognitionRequestRecord> _requests = new();
        private static int _nextId = 1;
        private static readonly object _lock = new();

        public IReadOnlyList<RecognitionRequestRecord> GetAll()
        {
            lock (_lock)
            {
                return _requests
                    .OrderByDescending(x => x.SubmittedAt)
                    .ToList();
            }
        }

        public RecognitionRequestRecord? GetById(int id)
        {
            lock (_lock)
            {
                return _requests.FirstOrDefault(x => x.Id == id);
            }
        }

        public RecognitionRequestRecord Add(RecognitionRequestRecord request)
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
                return request;
            }
        }

        public bool RequireAdminReview(int id)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.Status = "Requires Admin Review";
                return true;
            }
        }

        public bool SaveInfrastructureNotes(
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
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

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
                return true;
            }
        }

        public bool SaveAdmissionStudyDurationReview(int id, AdmissionStudyDurationReviewDto review)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.AdmissionStudyDurationReview = review ?? new AdmissionStudyDurationReviewDto();
                return true;
            }
        }

        public bool SaveGlobalRankings(int id, GlobalRankingsDto rankings)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.GlobalRankings = rankings ?? new GlobalRankingsDto();
                return true;
            }
        }

        public bool SaveBasicInfoAssessment(int id, string decision, string reason)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.BasicInfoAssessmentDecision = (decision ?? string.Empty).Trim();
                req.BasicInfoAssessmentReason = (reason ?? string.Empty).Trim();
                return true;
            }
        }

        public bool AssignMember(int id, string memberName)
        {
            lock (_lock)
            {
                var req = _requests.FirstOrDefault(x => x.Id == id);
                if (req == null) return false;

                req.AssignedMember = NormalizeAssignedMember(memberName);
                req.Status = NormalizeStatusForAssignment(req.Status, req.AssignedMember);

                return true;
            }
        }

        private static string NormalizeAssignedMember(string? memberName)
        {
            var value = (memberName ?? "").Trim().ToLowerInvariant();

            return value switch
            {
                "" => "Unassigned",
                "unassigned" => "Unassigned",
                "member1@mohe.local" => "member1@mohe.local",
                "member2@mohe.local" => "member2@mohe.local",
                "member3@mohe.local" => "member3@mohe.local",
                _ => "Unassigned"
            };
        }

        private static string NormalizeStatusForAssignment(string? currentStatus, string assignedMember)
        {
            if (assignedMember == "Unassigned")
                return "Pending";

            if (string.Equals(currentStatus, "Requires Admin Review", StringComparison.OrdinalIgnoreCase))
                return "Requires Admin Review";

            return "Assigned";
        }

        private static string NormalizeAssessmentStatus(string? value)
        {
            var normalized = (value ?? string.Empty).Trim();

            return normalized switch
            {
                "Meets Standards" => "Meets Standards",
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