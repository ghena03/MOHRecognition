using Microsoft.EntityFrameworkCore;
using MOHRecognition.DTOs;

namespace MOHRecognition.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext ctx)
    {
        await ctx.Database.MigrateAsync();
        await SeedAdvisorsAsync(ctx);
        await SeedEmployeesAsync(ctx);
    }

    private static async Task SeedAdvisorsAsync(AppDbContext ctx)
    {
        if (await ctx.Advisors.AnyAsync()) return;

        ctx.Advisors.AddRange(
            new AdvisorDto { Id = 1, FullName = "Prof. Suhail Haytham Hadadeen",    Email = "hadadeen@ju.edu.jo",    Phone = "", Specialization = "Medicine",  Workplace = "The University of Jordan",       Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 2, FullName = "Prof. Khalid Ahmad Draibekeh",     Email = "draibekeh@ju.edu.jo",   Phone = "", Specialization = "Medicine",  Workplace = "The University of Jordan",       Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 3, FullName = "Prof. Qasim Ahmad Al-Rdaideh",     Email = "rdaideh@yu.edu.jo",     Phone = "", Specialization = "Medicine",  Workplace = "Yarmouk University",             Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 4, FullName = "Prof. Suzan Nweisar Hater",        Email = "hater@ju.edu.jo",       Phone = "", Specialization = "Medicine",  Workplace = "The University of Jordan",       Type = AdvisorType.RecognitionMember },
            new AdvisorDto { Id = 5, FullName = "Dr. Aseel Al-Muhaysen",            Email = "aseel@mohe.gov.jo",     Phone = "", Specialization = "Administration", Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 6, FullName = "Dr. Basel Khudr",                  Email = "basel@mohe.gov.jo",     Phone = "", Specialization = "Administration", Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 7, FullName = "Prof. Dr. Azmi Mahafzah",          Email = "minister@mohe.gov.jo",  Phone = "", Specialization = "Administration", Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor },
            new AdvisorDto { Id = 8, FullName = "Mr. Shadi Al-Musa'idah",           Email = "secgen@mohe.gov.jo",    Phone = "", Specialization = "Administration", Workplace = "Ministry of Higher Education", Type = AdvisorType.MinistryAdvisor }
        );
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedEmployeesAsync(AppDbContext ctx)
    {
        if (await ctx.Employees.AnyAsync()) return;

        ctx.Employees.AddRange(
            new EmployeeDto { Id = 1,  Name = "H.E. Minister of Higher Education",  Email = "minister@mohe.gov.jo",  Workplace = "Ministry of Higher Education" },
            new EmployeeDto { Id = 2,  Name = "Secretary General",                  Email = "secgen@mohe.gov.jo",    Workplace = "Ministry of Higher Education" },
            new EmployeeDto { Id = 3,  Name = "Prof. Suhail Haytham Hadadeen",      Email = "hadadeen@ju.edu.jo",    Workplace = "The University of Jordan"     },
            new EmployeeDto { Id = 4,  Name = "Prof. Qasim Ahmad Al-Rdaideh",       Email = "rdaideh@yu.edu.jo",     Workplace = "Yarmouk University"           },
            new EmployeeDto { Id = 5,  Name = "Prof. Khalid Ahmad Draibekeh",       Email = "draibekeh@ju.edu.jo",   Workplace = "The University of Jordan"     },
            new EmployeeDto { Id = 6,  Name = "Prof. Suzan Nweisar Hater",          Email = "hater@ju.edu.jo",       Workplace = "The University of Jordan"     },
            new EmployeeDto { Id = 8,  Name = "Director of University Recognition", Email = "director@mohe.gov.jo",  Workplace = "Ministry of Higher Education" },
            new EmployeeDto { Id = 9,  Name = "Head of Recognition Section",        Email = "head@mohe.gov.jo",      Workplace = "Ministry of Higher Education" },
            new EmployeeDto { Id = 10, Name = "Deputy Section Head",                Email = "deputy@mohe.gov.jo",    Workplace = "Ministry of Higher Education" }
        );
        await ctx.SaveChangesAsync();
    }
}
