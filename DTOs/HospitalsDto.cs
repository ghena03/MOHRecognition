using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class HospitalFileDto
{
    public string OriginalFileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
}

public class HospitalsDto
{
    public List<HospitalRowDto> Rows { get; set; } = new();
    public List<string> Specializations { get; set; } = new();
    public List<HospitalFileDto> HospitalContracts { get; set; } = new();
}

public class HospitalRowDto
{
    public string Id { get; set; } = "";
    public string Specialization { get; set; } = "";
    public string Name { get; set; } = "";
    public string Major { get; set; } = "";
    public string RecognitionFileName { get; set; } = "";
    public string RecognitionStoredFileName { get; set; } = "";
    public string RecognitionFileUrl { get; set; } = "";
    public List<HospitalFileDto> RecognitionFiles { get; set; } = new();
}
