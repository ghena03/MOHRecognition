namespace MOHRecognition.DTOs
{
    public class MeetingDto
    {
        public int Id { get; set; }

        public int SessionNumber { get; set; }

        public DateTime MeetingDate { get; set; }

        public string? Notes { get; set; }

        // Added: store selected recognition request IDs (links to RecognitionRequestRecord.Id)
        public List<int> RequestIds { get; set; } = new List<int>();
    }
}