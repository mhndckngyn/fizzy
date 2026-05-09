using System.Text.Json;
using Domain.Entities;

namespace Feature.NotificationFeature;

internal static class EventMetadataExtensions
{
    public static TMetadata? GetMetadata<TMetadata>(this Event evnt) =>
        JsonSerializer.Deserialize<TMetadata>(evnt.Metadata);
}
