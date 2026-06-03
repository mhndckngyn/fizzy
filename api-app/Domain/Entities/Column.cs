using Domain.Common;
using FluentResults;

namespace Domain.Entities;

public class Column : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Color { get; set; } = null!;
    public Guid BoardId { get; set; }
    public int Position { get; set; }
    private readonly List<Card> _cards = [];
    public IReadOnlyCollection<Card> Cards => _cards.AsReadOnly();

    public Result AddCard(Card card)
    {
        if (card is null)
        {
            return Result.Fail("Card cannot be null.");
        }

        if (card.BoardId != BoardId)
        {
            return Result.Fail("Card and Column must belong to the same board.");
        }

        var result = card.MoveToColumn(Id);
        if (result.IsFailed)
        {
            return result;
        }

        if (!_cards.Contains(card))
        {
            _cards.Add(card);
        }

        return Result.Ok();
    }
}
