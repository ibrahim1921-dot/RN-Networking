import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
export default function Index() {
  const [postList, setPostList] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [errors, setErrors] = useState<{postTitle?: string; postBody?: string}>({});

  // Funciton to fetch data from API
  const fetchData = async (limit = 10) => {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`
      );
      const data = await response.json();
      setPostList(data);
    } catch (e) {
      console.error('Error while fetching data:', e);
    } finally {
      // finally always runs — success or failure — so the spinner always stops
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validate Form
  const validateForm = () => {
    let errors: {postTitle?: string, postBody?: string} = {};
    if(!postTitle) errors.postTitle = 'Title is required!';
    if(!postBody) errors.postBody = 'Body is required for post!';
    setErrors(errors);
    return Object.keys(errors).length===0
  }

  // Function to setup Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={styles.indicator}
        />
        <Text style={styles.loadingText}>Fetching posts...</Text>
      </SafeAreaView>
    );
  };

  // Function to handle pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(20).then(() => setIsRefreshing(false));
  }

  // function to add post
  const addPost = async () => {
    if (!validateForm()) return;
    setIsPosting(true);
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: postTitle,
            body: postBody,
          }),
        }
      );
      const newPost: Post = await response.json();
      setPostList([newPost, ...postList]);
      setPostTitle("");
      setPostBody("");
    } catch (e) {
      console.error('Error adding post:', e);
    } finally {
      // finally ensures the button is always re-enabled, even if the request fails
      setIsPosting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Post Title"
          value={postTitle}
          onChangeText={setPostTitle}
        />
        {
          errors.postTitle ? <Text style={{color: 'red', fontSize: 16}}>{errors.postTitle}</Text> : null
        }
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Post Body"
          value={postBody}
          onChangeText={setPostBody}
          multiline
          textAlignVertical="top"
        />
        {
          errors.postBody ? <Text style={{color: 'red', fontSize: 16}}>{errors.postBody}</Text> : null
        }
        <Button title={isPosting ? "Adding..." : "Add Post"} onPress={addPost} disabled={isPosting}/>
      </View>
        <View style={styles.listContainer}>
          <FlatList<Post>
            showsVerticalScrollIndicator={false}
            data={postList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: "white",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 24, marginTop: 8 }}>
                    {item.body}
                  </Text>
                </View>
              );
            }}
            ListHeaderComponent={() => (
              <Text
                style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: 'center' }}
              >
                Posts List
              </Text>
            )}
            ListFooterComponent={() => (
              <Text
                style={{
                  fontSize: 16,
                  color: "gray",
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                End of Posts
              </Text>
            )}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </View>
      </>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  indicator: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    margin: 16,

  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },

});
