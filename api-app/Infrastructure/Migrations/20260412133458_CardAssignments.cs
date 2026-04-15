using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CardAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "No",
                table: "Cards",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "CardAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssigneeMemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignerMemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CardAssignments_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id"
                    );
                    table.ForeignKey(
                        name: "FK_CardAssignments_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_CardAssignments_Members_AssigneeMemberId",
                        column: x => x.AssigneeMemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_CardAssignments_Members_AssignerMemberId",
                        column: x => x.AssignerMemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Cards_BoardId_No",
                table: "Cards",
                columns: new[] { "BoardId", "No" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardAssignments_AssigneeMemberId",
                table: "CardAssignments",
                column: "AssigneeMemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardAssignments_AssignerMemberId",
                table: "CardAssignments",
                column: "AssignerMemberId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardAssignments_BoardId",
                table: "CardAssignments",
                column: "BoardId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_CardAssignments_CardId_AssigneeMemberId",
                table: "CardAssignments",
                columns: new[] { "CardId", "AssigneeMemberId" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CardAssignments");

            migrationBuilder.DropIndex(name: "IX_Cards_BoardId_No", table: "Cards");

            migrationBuilder.DropColumn(name: "No", table: "Cards");
        }
    }
}
