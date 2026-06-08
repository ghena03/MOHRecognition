using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MOHRecognition.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvisorSortOrderAndPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old unique index on Email (was non-filtered)
            migrationBuilder.DropIndex(
                name: "IX_Advisors_Email",
                table: "Advisors");

            // Make Email nullable
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Advisors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            // Add Position column
            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Advisors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                defaultValue: "");

            // Add SortOrder column
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Advisors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Re-create the unique index as a filtered index (only for non-null, non-empty emails)
            migrationBuilder.CreateIndex(
                name: "IX_Advisors_Email",
                table: "Advisors",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL AND \"Email\" <> ''");

            // Create index on SortOrder
            migrationBuilder.CreateIndex(
                name: "IX_Advisors_SortOrder",
                table: "Advisors",
                column: "SortOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Advisors_SortOrder", table: "Advisors");
            migrationBuilder.DropIndex(name: "IX_Advisors_Email", table: "Advisors");
            migrationBuilder.DropColumn(name: "Position", table: "Advisors");
            migrationBuilder.DropColumn(name: "SortOrder", table: "Advisors");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Advisors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Advisors_Email",
                table: "Advisors",
                column: "Email",
                unique: true);
        }
    }
}
