using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using MOHRecognition.Data;
using MOHRecognition.DTOs;
using MOHRecognition.Services;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────────────────────
// OCALIZATION SERVICES
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddLocalization(options =>
{
    options.ResourcesPath = "Resources";
});

// ─────────────────────────────────────────────────────────────────────────────
// MVC — wire up view localization + data annotation localization
// ─────────────────────────────────────────────────────────────────────────────
builder.Services
    .AddControllersWithViews()
    .AddRazorRuntimeCompilation()
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();


builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});


// ─────────────────────────────────────────────────────────────────────────────
// DATABASE — PostgreSQL via EF Core
// ── TO SWITCH BACK TO DATABASE: uncomment the block below and remove the
//    IN-MEMORY block that follows it. ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// builder.Services.AddDbContext<AppDbContext>(opts =>
//     opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
//
// builder.Services.AddScoped<IRecognitionRequestService, DatabaseRecognitionRequestService>();
// builder.Services.AddScoped<IAdvisorService,            DatabaseAdvisorService>();
// builder.Services.AddScoped<IMeetingService,            DatabaseMeetingService>();

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY SERVICES (temporary — remove this block when switching back to DB)
// Singletons so all requests share the same static lists.
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IRecognitionRequestService, InMemoryRecognitionRequestService>();
builder.Services.AddSingleton<IAdvisorService,            InMemoryAdvisorService>();
builder.Services.AddSingleton<IMeetingService,            InMemoryMeetingService>();

// ─────────────────────────────────────────────────────────────────────────────
//    "en" = English (LTR)  — default
//    "ar" = Arabic  (RTL)
// ─────────────────────────────────────────────────────────────────────────────
var supportedCultures = new[]
{
    new CultureInfo("en"),
    new CultureInfo("ar"),
};


var localizationOptions = new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("en"),
    SupportedCultures    = supportedCultures,
    SupportedUICultures  = supportedCultures,
    // Only query-string and cookie — browser Accept-Language is intentionally ignored
    // so pages always default to English unless the user explicitly switches language.
    RequestCultureProviders = new List<IRequestCultureProvider>
    {
        new QueryStringRequestCultureProvider(),
        new CookieRequestCultureProvider(),
    },
};

var app = builder.Build();

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATE + SEED on startup
// ── TO SWITCH BACK TO DATABASE: uncomment the block below ───────────────────
// ─────────────────────────────────────────────────────────────────────────────
// using (var scope = app.Services.CreateScope())
// {
//     try
//     {
//         var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//         await DbInitializer.InitializeAsync(db);
//     }
//     catch (Exception ex)
//     {
//         Console.WriteLine($"[Startup] DB migration/seed failed: {ex.Message}");
//     }
// }

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRequestLocalization(localizationOptions);

// Serve wwwroot files (including /uploads/) with correct MIME types
var contentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
contentTypeProvider.Mappings[".xls"]  = "application/vnd.ms-excel";
contentTypeProvider.Mappings[".pdf"]  = "application/pdf";
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = contentTypeProvider
});

app.UseRouting();
app.UseSession();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Role}/{id?}")
    .WithStaticAssets();

app.Run();