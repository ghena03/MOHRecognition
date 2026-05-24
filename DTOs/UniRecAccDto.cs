namespace DTOs;

public class UniRecAccDocumentDto
{
    public string OriginalFileName { get; set; } = "";
    public string StoredFileName   { get; set; } = "";
    public string FileUrl          { get; set; } = "";
    public string DocumentType     { get; set; } = "";
    public DateTime? UploadedAt    { get; set; }
    public string UploadedBy       { get; set; } = "";
}

public class UniRecAccDto
{
    public List<UniRecAccDocumentDto> Documents { get; set; } = new();
}
