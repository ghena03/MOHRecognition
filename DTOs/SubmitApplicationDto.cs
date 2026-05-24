using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class AdditionalFileDto
{
    public string FileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string FileType { get; set; } = "";
    public DateTime? UploadedAt { get; set; }
}

public class SubmitApplicationDto
{
    public string ApplicantName { get; set; } = "";
    public string WorkPlace { get; set; } = "";
    public string Email { get; set; } = "";
    public bool IsAcknowledged { get; set; }
    public string? AdditionalNote { get; set; }
}
