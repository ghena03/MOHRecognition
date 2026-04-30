namespace MOHRecognition.DTOs
{
    public class MeetingDto
    {
        public int Id { get; set; }

        public int SessionNumber { get; set; }

        public DateTime MeetingDate { get; set; }

        public string? Notes { get; set; }
    }
}