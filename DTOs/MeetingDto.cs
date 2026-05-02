namespace MOHRecognition.DTOs
{
    public class MeetingDto
    {
        public int Id { get; set; }

        public int SessionNumber { get; set; }

        public string MeetingTitle { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public string MeetingTime { get; set; } = string.Empty;

        public string LocationOrPlatform { get; set; } = string.Empty;

        public string Status { get; set; } = "Scheduled";

        public string? Notes { get; set; }

        // Added: store selected recognition request IDs (links to RecognitionRequestRecord.Id)
        public List<int> RequestIds { get; set; } = new List<int>();
    }
}
