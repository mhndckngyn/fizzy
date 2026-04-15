using Domain.Common;

namespace Domain.Entities;

public class Card : BaseEntity
{
    public int No { get; set; }
    public string? Title { get; set; }
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public Guid CreatorMemberId { get; set; }
    public Member Creator { get; set; } = null!;
    public Guid? ColumnId { get; set; }

    // Trạng thái
    public CardNotNow? NotNow { get; set; }
    public CardMaybe? Maybe { get; set; }
    public CardDone? Done { get; set; }

    // Nội dung
    public CardContent? Content { get; set; }
    public ICollection<Comment> Comments { get; set; } = [];

    // Assignments
    public ICollection<CardAssignment> Assignments { get; set; } = [];
}
