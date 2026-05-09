namespace MOHRecognition.DTOs
{
    public class MeetingDecisionDto
    {
        public int MeetingId { get; set; }
        public int RequestId { get; set; }
        public string Decision { get; set; } = "";   // "Recognized" | "Not Recognized" | "Needs More Information"
        public string Notes { get; set; } = "";
        public DateTime? SavedAt { get; set; }
    }
}
