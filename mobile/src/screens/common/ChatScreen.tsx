import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";
import { api } from "../../api/client";
import * as SecureStore from "expo-secure-store";
import {
  ChatMessage,
  connectSocket,
  disconnectSocket,
  joinJobRoom,
  leaveJobRoom,
  sendMessage,
  onNewMessage,
  emitTyping,
  onTyping,
  markAsRead,
  onMessagesRead,
} from "../../services/chat";

interface DisplayMessage {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  read: boolean;
}

export default function ChatScreen({ route, navigation }: any) {
  const { jobId, receiverId, receiverName } = route.params;
  const user = useSelector((state: any) => state.auth.user);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const mapMessages = (msgs: ChatMessage[]): DisplayMessage[] =>
    msgs.map((m) => ({
      id: m._id,
      text: m.text,
      sent: m.senderId === user?._id,
      time: formatTime(m.createdAt),
      read: m.read,
    }));

  useEffect(() => {
    let cleanupNewMsg: (() => void) | undefined;
    let cleanupTyping: (() => void) | undefined;
    let cleanupRead: (() => void) | undefined;

    const init = async () => {
      await connectSocket();
      joinJobRoom(jobId);

      try {
        const token = await SecureStore.getItemAsync("token");
        const res = await api.get<{ data: ChatMessage[] }>(
          `/api/jobs?jobId=${jobId}&action=messages`,
          token || undefined
        );
        setMessages(mapMessages(res.data || []));
      } catch (err) {
        console.warn("Failed to fetch messages:", err);
      }

      cleanupNewMsg = onNewMessage((msg: ChatMessage) => {
        if (msg.jobId !== jobId) return;
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg._id);
          if (exists) return prev;
          return [
            ...prev,
            {
              id: msg._id,
              text: msg.text,
              sent: msg.senderId === user?._id,
              time: formatTime(msg.createdAt),
              read: msg.read,
            },
          ];
        });
      });

      cleanupTyping = onTyping((data) => {
        if (data.jobId !== jobId || data.userId === user?._id) return;
        setOtherTyping(data.isTyping);
      });

      cleanupRead = onMessagesRead((data) => {
        setMessages((prev) =>
          prev.map((m) =>
            data.messageIds.includes(m.id) ? { ...m, read: true } : m
          )
        );
      });
    };

    init();

    return () => {
      cleanupNewMsg?.();
      cleanupTyping?.();
      cleanupRead?.();
      leaveJobRoom(jobId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [jobId, user?._id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    sendMessage({ jobId, receiverId, text });
    emitTyping({ userId: user?._id, jobId, isTyping: false });
    isTypingRef.current = false;
    setInputText("");
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping({ userId: user?._id, jobId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitTyping({ userId: user?._id, jobId, isTyping: false });
    }, 2000);
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.sent ? styles.sentBubble : styles.receivedBubble,
      ]}
    >
      <Text style={[styles.messageText, item.sent && styles.sentText]}>
        {item.text}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.timeText}>{item.time}</Text>
        {item.sent && (
          <Ionicons
            name={item.read ? "checkmark-done" : "checkmark"}
            size={14}
            color={item.read ? Colors.primary : Colors.textMuted}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{receiverName || "Chat"}</Text>
          {otherTyping && (
            <Text style={styles.typingText}>typing...</Text>
          )}
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.surface : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  typingText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  headerAction: {
    padding: Spacing.xs,
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    marginBottom: Spacing.sm,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  sentText: {
    color: Colors.surface,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Spacing.xs,
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    maxHeight: 100,
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
    backgroundColor: Colors.border,
  },
});
