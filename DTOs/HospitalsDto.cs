using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class HospitalFileDto
{
    public string OriginalFileName { get; set; } = "";
    public string StoredFileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string DocumentType { get; set; } = "";
}

public class HospitalsDto
{
    public List<HospitalFacilityDto> Facilities { get; set; } = new();
    public List<HospitalFieldDto> Fields { get; set; } = new();
    public List<HospitalFileDto> Documents { get; set; } = new();
    public List<HospitalRowDto> Rows { get; set; } = new();
    public List<string> Specializations { get; set; } = new();
    public int? MedicineCapacity { get; set; }
    public int? DentistryCapacity { get; set; }
    // Kept for session backward-compatibility; no longer shown in UI
    public List<HospitalFileDto> HospitalContracts { get; set; } = new();
}

public class HospitalFacilityDto
{
    public string Id { get; set; } = "";
    public string Specialization { get; set; } = "";
    public string Name { get; set; } = "";
    public string Major { get; set; } = "";
    public int? BedCapacity { get; set; }
    public int? DentalChairCapacity { get; set; }
}

public class HospitalFieldDto
{
    public string Id { get; set; } = "";
    public string Specialization { get; set; } = "";
    public string FieldName { get; set; } = "";
    public string RelatedFacilityId { get; set; } = "";
}

public class HospitalRowDto
{
    public string Id { get; set; } = "";
    public string Specialization { get; set; } = "";
    public string Name { get; set; } = "";
    public string Major { get; set; } = "";
    public int? BedCapacity { get; set; }
    public int? DentalChairCapacity { get; set; }
    public string LocalAccreditation { get; set; } = "";
    public string InternationalAccreditation { get; set; } = "";
    public HospitalFileDto? AgreementFile { get; set; }
    public List<HospitalFileDto> AccreditationFiles { get; set; } = new();
}
