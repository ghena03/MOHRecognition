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
// DATABASE — SQLite via EF Core
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IRecognitionRequestService, DatabaseRecognitionRequestService>();
builder.Services.AddScoped<IAdvisorService,            DatabaseAdvisorService>();
builder.Services.AddScoped<IMeetingService,            DatabaseMeetingService>();

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
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures,
};


localizationOptions.RequestCultureProviders.Insert(0, new QueryStringRequestCultureProvider());

var app = builder.Build();

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATE + SEED on startup
// ─────────────────────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.InitializeAsync(db);
}

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

app.UseRouting();
app.UseSession();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Role}/{id?}")
    .WithStaticAssets();

app.Run();