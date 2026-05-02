using MOHRecognition.DTOs;

namespace MOHRecognition.Models
{
    public class RecognitionMemberMeetingsViewModel
    {
        public string CurrentRecognitionMember { get; set; } = "Recognition Member";
        public int? SessionNo { get; set; }
        public int? Year { get; set; }
        public List<MeetingDto> Meetings { get; set; } = new();
    }
}
