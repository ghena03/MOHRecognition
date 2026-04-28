namespace DTOs;

public class AdmissionStudyDurationReviewDto
{
    public string DiplomaDuration { get; set; } = "";
    public string DiplomaSamplePdfFileName { get; set; } = "";
    public string DiplomaSamplePdfContentBase64 { get; set; } = "";

    public string BScDuration { get; set; } = "";
    public string BScSamplePdfFileName { get; set; } = "";
    public string BScSamplePdfContentBase64 { get; set; } = "";

    public string HigherDiplomaDuration { get; set; } = "";
    public string HigherDiplomaSamplePdfFileName { get; set; } = "";
    public string HigherDiplomaSamplePdfContentBase64 { get; set; } = "";

    public string MasterDuration { get; set; } = "";
    public string MasterSamplePdfFileName { get; set; } = "";
    public string MasterSamplePdfContentBase64 { get; set; } = "";

    public string PhdDuration { get; set; } = "";
    public string PhdSamplePdfFileName { get; set; } = "";
    public string PhdSamplePdfContentBase64 { get; set; } = "";
}
