using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class AddOnlineEducationData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OnlineEducationJson",
                table: "RecognitionRequests",
                type: "TEXT",
                nullable: false,
                defaultValue: "{}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OnlineEducationJson",
                table: "RecognitionRequests");
        }
    }
}
