namespace MOHRecognition.DTOs
{
    public enum AdvisorType
    {
        RecognitionMember,
        MinistryAdvisor
    }

    public class AdvisorDto
    {
        public int    Id             { get; set; }
        public string FullName       { get; set; } = "";
        public string Email          { get; set; } = "";
        public string Phone          { get; set; } = "";
        public string Specialization { get; set; } = "";
        public string Workplace      { get; set; } = "";
        public AdvisorType Type      { get; set; } = AdvisorType.RecognitionMember;
    }
}
