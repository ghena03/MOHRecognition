using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    public partial class AddCommitteeFinalDecision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommitteeFinalDecision",
                table: "RecognitionRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CommitteeFinalRecommendation",
                table: "RecognitionRequests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "CommitteeFinalDecision",       table: "RecognitionRequests");
            migrationBuilder.DropColumn(name: "CommitteeFinalRecommendation", table: "RecognitionRequests");
        }
    }
}
