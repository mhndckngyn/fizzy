import { View, Text, Image, Pressable, Switch } from "react-native";
import { TopButton } from "@/components/ui/TopButton";
import { MenuItem } from "@/components/MenuItem";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";

export default function Profile() {
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [addPeople, setAddPeople] = useState(true);
  const user = {
    avatar: "https://myserver.com/uploads/avatar123.jpg",
  };

  const [tags, setTags] = useState([
    { id: 1, name: "design" },
    { id: 2, name: "mobile" },
    { id: 3, name: "web" },
  ]);
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      console.log("Logged out");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#f3f3f3",
        paddingTop: 55,
      }}
    >
      {/* PROFILE CARD */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: user.avatar }} // Thêm link ảnh mẫu avatar
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>alex</Text>
            <Text style={{ color: "gray" }}>alex-nguyen</Text>
          </View>

          <View
            style={{
              backgroundColor: "#4ade80",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", color: "white" }}>PRO</Text>
          </View>
        </View>
      </View>

      {/* TOP BUTTONS ROW */}
      <View style={{ flexDirection: "row", marginBottom: 16, gap: 10 }}>
        <TopButton title="Home" icon="home" />
        <TopButton title="Assigned me" icon="clipboard" />
        <TopButton title="Added by me" icon="person-add" />
      </View>

      {/* BOARDS */}
      <View style={{ marginTop: 10 }}>
        <Pressable
          onPress={() => setBoardsOpen(!boardsOpen)}
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
          <Ionicons
            name={boardsOpen ? "chevron-down" : "chevron-forward"}
            size={16}
          />
          <Text style={{ fontWeight: "bold" }}>BOARDS</Text>
        </Pressable>

        {boardsOpen && (
          <View style={{ paddingLeft: 10 }}>
            <MenuItem
              title="Add a board"
              icon="add"
              onPress={() => console.log("add board")}
            />
            <MenuItem
              title="Feature Priority"
              onPress={() => console.log("feature priority")}
            />
            <MenuItem
              title="Task Tracker"
              onPress={() => console.log("task tracker")}
            />
            <MenuItem
              title="mobile app"
              onPress={() => console.log("mobile app")}
            />
            <MenuItem
              title="Playground"
              onPress={() => console.log("playground")}
            />
          </View>
        )}
      </View>
      {/* TAGS */}
      <View style={{ marginTop: 10 }}>
        <Pressable
          onPress={() => setTagsOpen(!tagsOpen)}
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
          <Ionicons
            name={tagsOpen ? "chevron-down" : "chevron-forward"}
            size={16}
          />
          <Text style={{ fontWeight: "bold" }}>TAGS</Text>
        </Pressable>

        {tagsOpen && (
          <View style={{ paddingLeft: 10 }}>
            {tags.map((tag) => (
              <MenuItem
                key={tag.id}
                title={tag.name}
                icon="pricetag"
                onPress={() => console.log("press tag", tag.name)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ marginTop: 10 }}>
        <Pressable
          onPress={() => setAddPeople(!addPeople)}
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
          <Ionicons
            name={addPeople ? "chevron-down" : "chevron-forward"}
            size={16}
          />
          <Text style={{ fontWeight: "bold" }}>ADD PEOPLE</Text>
        </Pressable>
        {addPeople && (
          <View style={{ paddingLeft: 10 }}>
            <MenuItem
              title="Add people"
              icon="add"
              onPress={() => console.log("add people")}
            />
          </View>
        )}
      </View>
      {/* FOOTER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor: "#ff4d4f",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}
