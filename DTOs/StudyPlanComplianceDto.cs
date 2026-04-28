using System;
using System.Collections.Generic;

namespace DTOs;

public class StudyPlanComplianceRowDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    public string ProgramId { get; set; } = "";
    public string ProgramName { get; set; } = "";

    public int UniversityRequirementsHours { get; set; }
    public int FacultyRequirementsHours { get; set; }
    public int SpecializationRequirementsHours { get; set; }

    public int TheoreticalHours { get; set; }
    public int PracticalHours { get; set; }

    public int SpecializationTheoreticalPercent { get; set; }
    public int SpecializationPracticalPercent { get; set; }

    public int BasicDomainsCount { get; set; }
    public int PracticalTrainingMonths { get; set; }
    public int GraduationProjectHours { get; set; }

    public string RuleReference { get; set; } = "AQACHEI-4";
}

public class StudyPlanComplianceDto
{
    public List<StudyPlanComplianceRowDto> Rows { get; set; } = new();

    public List<ProgramRowDto> Programs { get; set; } = new();
}
