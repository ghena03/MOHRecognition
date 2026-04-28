using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class AdmissionRequirementsDto
{

    public List<AdmissionRequirementRowDto> Diploma { get; set; } = new();
    public List<AdmissionRequirementRowDto> BSC { get; set; } = new();
    public List<AdmissionRequirementRowDto> HigherDiploma { get; set; } = new();
    public List<AdmissionRequirementRowDto> Master { get; set; } = new();
    public List<AdmissionRequirementRowDto> PhD { get; set; } = new();





}
