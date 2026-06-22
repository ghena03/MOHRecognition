using MOHRecognition.DTOs;

namespace MOHRecognition.Models
{
    public class SessionReportViewModel
    {
        public MeetingDto Meeting { get; set; } = new();
        public List<SessionReportAttendee> Attendees { get; set; } = new();
        public List<SessionReportRow> Rows { get; set; } = new();
    }

    public class SessionReportAttendee
    {
        public string Name     { get; set; } = "";
        public string NameAr   { get; set; } = "";
        public bool   IsPresent{ get; set; }
    }

    public class SessionReportRow
    {
        public int    SequenceNumber     { get; set; }
        public string UniversityName     { get; set; } = "";
        public string Country            { get; set; } = "";
        public string CommitteeDecision  { get; set; } = "";
        public string Recommendation     { get; set; } = "";
    }
}
