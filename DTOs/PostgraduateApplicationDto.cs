using Microsoft.AspNetCore.Http;

namespace MOHRecognition.DTOs
{
    public class PostgraduateApplicationDto
    {
        // ================= PROGRAM FILES =================

        public IFormFile? MasterFile { get; set; }

        public IFormFile? PhDFile { get; set; }

        public IFormFile? DiplomaFile { get; set; }


        // ================= STUDENTS =================

        public int? MasterStudents { get; set; }

        public int? PhDStudents { get; set; }

        public int? DiplomaStudents { get; set; }


        // ================= ACADEMIC STAFF =================

        // MASTER
        public int? MasterProfessor { get; set; }

        public int? MasterAssociate { get; set; }

        public int? MasterAssistant { get; set; }

        // PHD
        public int? PhDProfessor { get; set; }

        public int? PhDAssociate { get; set; }

        public int? PhDAssistant { get; set; }

        // DIPLOMA
        public int? DiplomaProfessor { get; set; }

        public int? DiplomaAssociate { get; set; }

        public int? DiplomaAssistant { get; set; }


        // ================= APPLICANT INFO =================

        public string? Name { get; set; }

        public string? Email { get; set; }

        public string? Location { get; set; }

        // ================= PUBLIC INFO =================

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
