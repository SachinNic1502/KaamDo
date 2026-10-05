import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import {
  connectSocket,
  disconnectSocket,
  joinJobRoom,
  leaveJobRoom,
  sendMessage,
  onNewMessage,
  emitTyping,
  onTyping,
  markAsRead,
} from "../../../services/chat";
import { AppHeader, Avatar } from "../../../components/ui";
import { api } from "../../../services/api";
import * as SecureStore from "../../../services/storage";

interface DisplayMessage {
  id: string;
  text: string;
  mediaUrl?: string;
  sent: boolean;
  time: string;
  read: boolean;
}

export default function CustomerChatScreen({ route, navigation }: any) {
  const { jobId, receiverId, receiverName } = route.params || {};
  const user = useSelector((state: any) => state.auth.user);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchHistory = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const res = await api.get<{ data: any[] }>(`/api/messages?jobId=${jobId}`, token || undefined);
        if (res.data && Array.isArray(res.data)) {
          const history: DisplayMessage[] = res.data.map((m: any) => ({
            id: m._id || String(Date.now()),
            text: m.message || m.text || "",
            mediaUrl: m.mediaUrl || m.attachments?.[0]?.url || (typeof m.media === "string" ? m.media : undefined),
            sent: (m.senderId?._id || m.senderId) === user?._id,
            time: new Date(m.createdAt || Date.now()).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: m.read || false,
          }));
          setMessages(history);
        }
      } catch {}
    };

    fetchHistory();

    connectSocket().then(() => {
      joinJobRoom(jobId);
    });

    const unsubMsg = onNewMessage((msg: any) => {
      if (msg.jobId === jobId) {
        const isFromMe = (msg.senderId?._id || msg.senderId) === user?._id;
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id || String(Date.now()),
            text: msg.message || msg.text || "",
            mediaUrl: msg.mediaUrl || msg.attachments?.[0]?.url,
            sent: isFromMe,
            time: new Date(msg.createdAt || Date.now()).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: false,
          },
        ]);
        if (!isFromMe) {
          markAsRead({ jobId, messageIds: [msg._id] });
        }
      }
    });

    const unsubTyping = onTyping((data) => {
      if (data.jobId === jobId && data.userId !== user?._id) {
        setOtherTyping(data.isTyping);
      }
    });

    return () => {
      leaveJobRoom(jobId);
      unsubMsg();
      unsubTyping();
    };
  }, [jobId]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !jobId) return;

    sendMessage({
      jobId,
      receiverId: receiverId || "",
      text: trimmed,
    });

    setInputText("");
    emitTyping({ jobId, userId: user?._id || "", isTyping: false });
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!jobId) return;

    emitTyping({ jobId, userId: user?._id || "", isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping({ jobId, userId: user?._id || "", isTyping: false });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title={receiverName || "Technician Chat"}
        subtitle={otherTyping ? "typing..." : "Active Job Conversation"}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sent ? styles.sentBubble : styles.receivedBubble,
              ]}
            >
              {item.mediaUrl && (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{ width: 220, height: 160, borderRadius: 8, marginBottom: 6 }}
                  resizeMode="cover"
                />
              )}
              {item.text ? (
                <Text
                  style={[
                    styles.messageText,
                    item.sent ? styles.sentText : styles.receivedText,
                  ]}
                >
                  {item.text}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.messageTime,
                  item.sent ? styles.sentTime : styles.receivedTime,
                ]}
              >
                {item.time}
              </Text>
            </View>
          )}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  messageList: {
    padding: Spacing.base,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.xs,
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  sentText: {
    color: Colors.white,
  },
  receivedText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: FontSize.xxs,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  sentTime: {
    color: "rgba(255,255,255,0.7)",
  },
  receivedTime: {
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
});
