namespace DTOs;

public class AccreditationBodyRowDto
{
    public string Id { get; set; } = "";
    public string AccreditationBodyName { get; set; } = "";
    public string AccreditationType { get; set; } = "";
    public string PdfOriginalFileName { get; set; } = "";
    public string PdfStoredFileName { get; set; } = "";
    public string PdfFileUrl { get; set; } = "";
}

public class AccreditationBodiesDto
{
    public List<AccreditationBodyRowDto> Rows { get; set; } = new();
}
