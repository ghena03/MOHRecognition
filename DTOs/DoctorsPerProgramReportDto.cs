namespace DTOs;

public class DoctorsPerProgramReportDto
{
    public List<DppUniversityRow> Universities { get; set; } = new();

    public int TotalUniversities => Universities.Count;
    public int TotalPrograms     => Universities.Sum(u => u.ProgramCount);
    public int TotalFtPhdDoctors => Universities.Sum(u => u.FtPhdDoctors);

    public double AverageDoctorsPerProgram =>
        TotalPrograms > 0 ? (double)TotalFtPhdDoctors / TotalPrograms : 0;
}

public class DppUniversityRow
{
    public string UniversityName { get; set; } = string.Empty;
    public string Country        { get; set; } = string.Empty;
    public int    FtPhdDoctors   { get; set; }
    public List<DppProgramRow> Programs { get; set; } = new();

    public int    ProgramCount        => Programs.Count;
    public double DoctorsPerProgram   => ProgramCount > 0 ? (double)FtPhdDoctors / ProgramCount : 0;
}

public class DppProgramRow
{
    public string ProgramName   { get; set; } = string.Empty;
    public string DegreeAwarded { get; set; } = string.Empty;
    public string FacultyName   { get; set; } = string.Empty;
}
