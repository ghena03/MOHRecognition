using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Advisors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Email = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Specialization = table.Column<string>(type: "text", nullable: false),
                    Workplace = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Advisors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Email = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Workplace = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeetingAttendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MeetingId = table.Column<int>(type: "integer", nullable: false),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    IsPresent = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingAttendances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeetingDecisions",
                columns: table => new
                {
                    MeetingId = table.Column<int>(type: "integer", nullable: false),
                    RequestId = table.Column<int>(type: "integer", nullable: false),
                    Decision = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    SavedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingDecisions", x => new { x.MeetingId, x.RequestId });
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionNumber = table.Column<int>(type: "integer", nullable: false),
                    MeetingTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MeetingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MeetingTime = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LocationOrPlatform = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RequestIdsJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecognitionRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InstitutionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RecognitionNumber = table.Column<string>(type: "text", nullable: false),
                    UniversityName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Country = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UniversityEmail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ApplicantName = table.Column<string>(type: "text", nullable: false),
                    WorkPlace = table.Column<string>(type: "text", nullable: false),
                    ApplicantEmail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AssignedMember = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SubmittedToAdminBy = table.Column<string>(type: "text", nullable: false),
                    SubmittedToAdminAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PublicInfoJson = table.Column<string>(type: "TEXT", nullable: false),
                    AcademicInfoJson = table.Column<string>(type: "TEXT", nullable: false),
                    SubmitApplicationJson = table.Column<string>(type: "TEXT", nullable: false),
                    FacultiesJson = table.Column<string>(type: "TEXT", nullable: false),
                    ProgramsJson = table.Column<string>(type: "TEXT", nullable: false),
                    ProgramHoursJson = table.Column<string>(type: "TEXT", nullable: false),
                    StudyPlanComplianceJson = table.Column<string>(type: "TEXT", nullable: false),
                    AccreditationBodiesJson = table.Column<string>(type: "TEXT", nullable: false),
                    AdmissionRequirementsJson = table.Column<string>(type: "TEXT", nullable: false),
                    StudyDurationJson = table.Column<string>(type: "TEXT", nullable: false),
                    MedicineDentistryJson = table.Column<string>(type: "TEXT", nullable: false),
                    AdmissionStudyDurationReviewJson = table.Column<string>(type: "TEXT", nullable: false),
                    GlobalRankingsJson = table.Column<string>(type: "TEXT", nullable: false),
                    AttachmentsJson = table.Column<string>(type: "TEXT", nullable: false),
                    PicturesJson = table.Column<string>(type: "TEXT", nullable: false),
                    LaboratoriesJson = table.Column<string>(type: "TEXT", nullable: false),
                    InfrastructureJson = table.Column<string>(type: "TEXT", nullable: false),
                    HospitalsJson = table.Column<string>(type: "TEXT", nullable: false),
                    LibraryJson = table.Column<string>(type: "TEXT", nullable: false),
                    FacultiesAssessment = table.Column<string>(type: "text", nullable: false),
                    FacultiesAssessmentNote = table.Column<string>(type: "text", nullable: false),
                    HospitalsAssessment = table.Column<string>(type: "text", nullable: false),
                    HospitalsAssessmentNote = table.Column<string>(type: "text", nullable: false),
                    HospitalEnvironmentAssessment = table.Column<string>(type: "text", nullable: false),
                    HospitalEnvironmentAssessmentNote = table.Column<string>(type: "text", nullable: false),
                    LaboratoriesFacilitiesAssessment = table.Column<string>(type: "text", nullable: false),
                    LaboratoriesFacilitiesAssessmentNote = table.Column<string>(type: "text", nullable: false),
                    LibraryAssessment = table.Column<string>(type: "text", nullable: false),
                    LibraryAssessmentNote = table.Column<string>(type: "text", nullable: false),
                    BasicInfoAssessmentDecision = table.Column<string>(type: "text", nullable: false),
                    BasicInfoAssessmentReason = table.Column<string>(type: "text", nullable: false),
                    AccreditationStatus = table.Column<string>(type: "text", nullable: false),
                    AccreditationNote = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RecognitionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsManual = table.Column<bool>(type: "boolean", nullable: false),
                    ManualDataFilled = table.Column<bool>(type: "boolean", nullable: false),
                    ApplicationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecognitionRequests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Advisors_Email",
                table: "Advisors",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Advisors_Type",
                table: "Advisors",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingAttendances_MeetingId",
                table: "MeetingAttendances",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingAttendances_MeetingId_EmployeeId",
                table: "MeetingAttendances",
                columns: new[] { "MeetingId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MeetingDecisions_Decision",
                table: "MeetingDecisions",
                column: "Decision");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingDecisions_MeetingId",
                table: "MeetingDecisions",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingDecisions_RequestId",
                table: "MeetingDecisions",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_MeetingDate",
                table: "Meetings",
                column: "MeetingDate");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_SessionNumber",
                table: "Meetings",
                column: "SessionNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_Status",
                table: "Meetings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_ApplicationType",
                table: "RecognitionRequests",
                column: "ApplicationType");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_AssignedMember",
                table: "RecognitionRequests",
                column: "AssignedMember");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_IsManual",
                table: "RecognitionRequests",
                column: "IsManual");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_ReferenceNumber",
                table: "RecognitionRequests",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_Status",
                table: "RecognitionRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_SubmittedAt",
                table: "RecognitionRequests",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionRequests_Year",
                table: "RecognitionRequests",
                column: "Year");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Advisors");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "MeetingAttendances");

            migrationBuilder.DropTable(
                name: "MeetingDecisions");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "RecognitionRequests");
        }
    }
}
