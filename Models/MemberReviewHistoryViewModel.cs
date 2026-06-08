namespace MOHRecognition.Models
{
    public class MemberReviewHistoryViewModel
    {
        public string FilterDecision  { get; set; } = "All";
        public string FilterCommittee { get; set; } = "All";
        public string FilterType      { get; set; } = "All";
        public string FilterYear      { get; set; } = "All";
        public string FilterCountry   { get; set; } = "All";
        public string Search          { get; set; } = "";

        public List<string> AvailableTypes     { get; set; } = new();
        public List<string> AvailableCountries { get; set; } = new();
        public List<int>    AvailableYears     { get; set; } = new();

        public int TotalReviewed    { get; set; }
        public int ApprovedCount    { get; set; }
        public int ConditionalCount { get; set; }
        public int RejectedCount    { get; set; }
        public int RecognizedCount  { get; set; }

        public List<MemberReviewHistoryItem> Items { get; set; } = new();
    }

    public class MemberReviewHistoryItem
    {
        public int    RequestId        { get; set; }
        public string ReferenceNumber  { get; set; } = "";
        public string UniversityName   { get; set; } = "";
        public string Country          { get; set; } = "";
        public string ApplicationType  { get; set; } = "";
        public int    Year             { get; set; }
        public string RequestStatus    { get; set; } = "";

        // Member's review
        public string    MemberDecision      { get; set; } = "";
        public string    MemberJustification { get; set; } = "";
        public DateTime? SubmittedToAdminAt  { get; set; }

        // Session
        public int?      SessionNumber { get; set; }
        public DateTime? MeetingDate   { get; set; }

        // Committee outcome
        public string    CommitteeDecision     { get; set; } = "";
        public string    CommitteeNotes        { get; set; } = "";
        public DateTime? CommitteeDecisionDate { get; set; }
    }
}
