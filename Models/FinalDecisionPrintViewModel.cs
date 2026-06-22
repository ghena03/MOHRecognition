namespace MOHRecognition.Models
{
    public class FinalDecisionPrintViewModel
    {
        public int    RequestId                   { get; set; }
        public string UniversityName              { get; set; } = "";
        public string Country                     { get; set; } = "";
        public string CommitteeFinalDecision      { get; set; } = "";
        public string CommitteeFinalRecommendation{ get; set; } = "";
        public string ReferenceNumber             { get; set; } = "";
        public string SessionNumber               { get; set; } = "";
        public string SessionDate                 { get; set; } = "";
        public int?   MeetingId                   { get; set; }
    }
}
