using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCardLastActiveAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Events_TeamId", table: "Events");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActiveAt",
                table: "Cards",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.CreateIndex(
                name: "IX_Events_TeamId_CreatedAt",
                table: "Events",
                columns: new[] { "TeamId", "CreatedAt" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Events_TeamId_CreatedAt", table: "Events");

            migrationBuilder.DropColumn(name: "LastActiveAt", table: "Cards");

            migrationBuilder.CreateIndex(
                name: "IX_Events_TeamId",
                table: "Events",
                column: "TeamId"
            );
        }
    }
}
