namespace MOHRecognition.DTOs
{
    public class DecisionItemDto
    {
        public int RequestId { get; set; }
        public string UniversityName { get; set; } = "";
        public string Country { get; set; } = "";
        public string ReferenceNumber { get; set; } = "";
        public int SessionNumber { get; set; }
        public int MeetingId { get; set; }
        public DateTime MeetingDate { get; set; }
        public string Decision { get; set; } = "";
        public string Notes { get; set; } = "";
        public DateTime? DecisionDate { get; set; }
        public string ApplicationType { get; set; } = "Bachelor";
    }
}
