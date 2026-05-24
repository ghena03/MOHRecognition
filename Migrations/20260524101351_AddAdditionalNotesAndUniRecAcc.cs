using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalNotesAndUniRecAcc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdditionalFilesJson",
                table: "RecognitionRequests",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalNote",
                table: "RecognitionRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UniRecAccJson",
                table: "RecognitionRequests",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalFilesJson",
                table: "RecognitionRequests");

            migrationBuilder.DropColumn(
                name: "AdditionalNote",
                table: "RecognitionRequests");

            migrationBuilder.DropColumn(
                name: "UniRecAccJson",
                table: "RecognitionRequests");
        }
    }
}
