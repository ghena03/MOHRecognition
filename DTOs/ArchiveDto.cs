namespace MOHRecognition.DTOs
{
    public class ArchiveDto
    {
        public int Id { get; set; }

        public string ReferenceNumber { get; set; } = string.Empty;

        public string UniversityName { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string AssignedMember { get; set; } = "Unassigned";

        public string Status { get; set; } = "Pending";

        public int Year { get; set; }

        public DateTime SubmittedAt { get; set; }
    }
}