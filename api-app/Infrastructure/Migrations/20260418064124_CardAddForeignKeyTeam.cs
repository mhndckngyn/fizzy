using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CardAddForeignKeyTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "Cards",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.CreateIndex(name: "IX_Cards_TeamId", table: "Cards", column: "TeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_Teams_TeamId",
                table: "Cards",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Cards_Teams_TeamId", table: "Cards");

            migrationBuilder.DropIndex(name: "IX_Cards_TeamId", table: "Cards");

            migrationBuilder.DropColumn(name: "TeamId", table: "Cards");
        }
    }
}
