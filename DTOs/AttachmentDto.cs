using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class AttachmentRowDto
{
    public string Id { get; set; } = "";
    public string Subject { get; set; } = "";
    public string FileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string ContentType { get; set; } = "";
    public DateTime UploadedAt { get; set; }
}

public class AttachmentDto
{
    public List<AttachmentRowDto> Rows { get; set; } = new();
    public List<string> RequiredFiles { get; set; } = new();
}
