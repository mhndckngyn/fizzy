import { Edit3 } from "@tamagui/lucide-icons-2";
import { Link } from "expo-router";
import RenderHtml, { CustomTextualRenderer } from "react-native-render-html";
import { Button, Text, useWindowDimensions, View, XStack } from "tamagui";

type Props = {
  title: string;
  htmlContent: string;
  teamId: string;
  activeColor: string;
  onEditPress: () => void;
};

const CardStaticView = ({
  title,
  htmlContent,
  teamId,
  activeColor,
  onEditPress,
}: Props) => {
  const { width } = useWindowDimensions();

  const renderersProps = {
    ul: {
      markerTextStyle: {
        lineHeight: 28,
        marginRight: 5,
      },
    },
    ol: {
      markerTextStyle: {
        lineHeight: 28,
      },
    },
  };

  const SpanRenderer: CustomTextualRenderer = ({
    TDefaultRenderer,
    ...props
  }) => {
    const { tnode } = props;

    if (tnode.classes?.includes("mention")) {
      const mentionNodeStyling = {
        color: "#0b65da",
        fontWeight: 600,
      };

      const char = tnode.attributes["data-mention-suggestion-char"];
      const id = tnode.attributes["data-id"];
      const isCard = char === "#";

      const mentionText = tnode.attributes["data-label"];

      if (isCard) {
        return (
          <Link href={`/teams/${teamId}/cards/${id}`} asChild>
            <Text style={mentionNodeStyling}>{mentionText}</Text>
          </Link>
        );
      } else {
        return <Text style={mentionNodeStyling}>{mentionText}</Text>;
      }
    }

    return <TDefaultRenderer {...props} />;
  };

  return (
    <View>
      <XStack justifyContent="space-between" alignItems="center" mb="$3">
        <Text fontSize="$8" fontWeight="bold" flex={1} mr="$2">
          {title}
        </Text>
        <Button
          circular
          size="$3"
          icon={<Edit3 size={16} color={activeColor} />}
          onPress={onEditPress}
          backgroundColor={`${activeColor}15`}
          borderColor={`${activeColor}20`}
          borderWidth={1}
          pressStyle={{
            scale: 0.95,
            backgroundColor: `${activeColor}25`,
          }}
          hoverStyle={{
            backgroundColor: `${activeColor}20`,
          }}
        />
      </XStack>

      <RenderHtml
        contentWidth={width}
        source={{ html: htmlContent || "<p>No description provided.</p>" }}
        renderers={{ span: SpanRenderer }}
        renderersProps={renderersProps}
        tagsStyles={{
          strong: { fontWeight: "bold" },
          b: { fontWeight: "bold" },
          em: { fontStyle: "italic" },
          i: { fontStyle: "italic" },
          a: { color: "#0284c7", textDecorationLine: "underline" },
          p: { marginVertical: 4 },
          ul: { paddingLeft: 20 },
          ol: { paddingLeft: 20 },
        }}
      />
    </View>
  );
};

export default CardStaticView;
