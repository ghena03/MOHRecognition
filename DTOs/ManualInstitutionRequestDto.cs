namespace MOHRecognition.DTOs
{
    public class ManualInstitutionRequestDto
    {
        public string InstitutionName { get; set; }

        public string Country { get; set; }

        public string City { get; set; }

        public string InstitutionType { get; set; }

        public string AssignedMember { get; set; }

        public string Status { get; set; } = "Assigned";
    }
}