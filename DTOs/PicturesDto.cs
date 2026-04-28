using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class PictureRowDto
{
    public string Id { get; set; } = "";
    public string Subject { get; set; } = "";
    public string FileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string ContentType { get; set; } = "";
    public DateTime UploadedAt { get; set; }
}

public class PicturesDto
{
    public List<PictureRowDto> Rows { get; set; } = new();
}
