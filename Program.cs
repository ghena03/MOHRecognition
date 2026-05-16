using Microsoft.AspNetCore.Localization;
using System.Globalization;
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


builder.Services.AddSingleton<IRecognitionRequestService, InMemoryRecognitionRequestService>();

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