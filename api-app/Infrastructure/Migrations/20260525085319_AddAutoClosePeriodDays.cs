using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoClosePeriodDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AutoClosePeriodDays",
                table: "Teams",
                type: "integer",
                nullable: false,
                defaultValue: 30
            );

            migrationBuilder.AddColumn<int>(
                name: "AutoClosePeriodDays",
                table: "Boards",
                type: "integer",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "AutoClosePeriodDays", table: "Teams");

            migrationBuilder.DropColumn(name: "AutoClosePeriodDays", table: "Boards");
        }
    }
}
