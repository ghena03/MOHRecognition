using Microsoft.AspNetCore.Http;
namespace MOHRecognition.DTOs
{
    public class OnlineEducationDto
    {
        // ================= PROGRAMS =================
        public IFormFile? ProgramFile { get; set; }
        public string? ProgramFileName { get; set; }

        // ================= STUDENTS =================
        public int? OnlineStudents { get; set; }

        // ================= ACADEMIC STAFF =================
        public int? Professor { get; set; }
        public int? AssociateProfessor { get; set; }
        public int? AssistantProfessor { get; set; }

        // ================= APPLICANT INFO =================
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Location { get; set; }

        // ================= PUBLIC INFO (shared) =================
        public string? InstitutionName { get; set; }
        public string? OversightRightsEntity { get; set; }
        public string? FoundationDate { get; set; }
        public string? DateOfEstablishment { get; set; }
        public string? ModeOfStudy { get; set; }
        public string? LanguageOfInstruction { get; set; }
        public string? StartOfTeaching { get; set; }
        public string? PresidentName { get; set; }
        public string? MailingFullAddress { get; set; }
        public string? DirectPhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? InstitutionalWebAddress { get; set; }
    }
}
