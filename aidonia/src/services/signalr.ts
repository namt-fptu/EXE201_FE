import * as signalR from "@microsoft/signalr";
import { Message } from "@/services/chat";

export interface ChatConnectionCallbacks {
  onMessageReceived?: (message: Message) => void;
  onNewMessage?: (conversationId: number) => void;
  onTypingStart?: (userId: number, userName: string) => void;
  onTypingStop?: (userId: number) => void;
  onError?: (error: string) => void;
}

// Real-time SignalR chat service
class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: ChatConnectionCallbacks = {};
  private currentUserId: number | null = null;
  private joinedConversations: Set<number> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isInitialized = false;

  // Initialize SignalR connection (lazy initialization)
  private initializeConnection() {
    // Only initialize in browser environment
    if (typeof window === "undefined") {
      console.warn("⚠️ SignalR cannot be initialized in server environment");
      return;
    }

    if (this.isInitialized) {
      return;
    }

    // Get base URL and remove /api/ suffix if present since SignalR hub is at root level
    let baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, "");

    // Remove /api suffix since SignalR hub is mapped at root level (not under /api)
    baseUrl = baseUrl.replace(/\/api$/, "");

    const hubUrl = `${baseUrl}/chathub`;

    console.log("🔌 Initializing SignalR connection to:", hubUrl);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Don't skip negotiation - let SignalR negotiate the best transport
        accessTokenFactory: () => {
          // Get token from localStorage
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("token")?.replaceAll('"', "");
            return token || "";
          }
          return "";
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          return Math.min(
            2000 * Math.pow(2, retryContext.previousRetryCount),
            32000
          );
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.isInitialized = true;
  }

  // Setup SignalR event handlers
  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle new messages
    this.connection.on("ReceiveMessage", (message: Message) => {
      console.log("📨 SignalR: Received message", message);
      this.callbacks.onMessageReceived?.(message);
      this.callbacks.onNewMessage?.(message.conversationId);
    });

    // Handle typing started event
    this.connection.on(
      "UserStartedTyping",
      (userId: number, userName: string, conversationId: number) => {
        console.log(
          `⌨️ SignalR: User ${userName} (${userId}) started typing in conversation ${conversationId}`
        );
        // Only trigger callback if it's not the current user
        if (userId !== this.currentUserId) {
          this.callbacks.onTypingStart?.(userId, userName);
        }
      }
    );

    // Handle typing stopped event
    this.connection.on(
      "UserStoppedTyping",
      (userId: number, conversationId: number) => {
        console.log(
          `⌨️ SignalR: User ${userId} stopped typing in conversation ${conversationId}`
        );
        // Only trigger callback if it's not the current user
        if (userId !== this.currentUserId) {
          this.callbacks.onTypingStop?.(userId);
        }
      }
    );

    // Connection lifecycle events
    this.connection.onclose((error) => {
      console.log("❌ SignalR connection closed", error);
      this.callbacks.onError?.(
        `Connection closed: ${error?.message || "Unknown error"}`
      );
      this.attemptReconnect();
    });

    this.connection.onreconnecting((error) => {
      console.log("🔄 SignalR reconnecting...", error);
      this.callbacks.onError?.("Reconnecting to chat server...");
    });

    this.connection.onreconnected((connectionId) => {
      console.log("✅ SignalR reconnected:", connectionId);
      this.reconnectAttempts = 0;
      // Rejoin all conversations
      this.rejoinConversations();
    });
  }

  // Start SignalR connection
  async start(): Promise<boolean> {
    // Ensure connection is initialized (lazy init)
    if (!this.connection) {
      this.initializeConnection();
    }

    if (!this.connection) {
      console.error("❌ SignalR connection not initialized");
      return false;
    }

    if (
      this.connection.state === signalR.HubConnectionState.Connected ||
      this.connection.state === signalR.HubConnectionState.Connecting
    ) {
      console.log("✅ SignalR already connected or connecting");
      return true;
    }

    try {
      console.log("🚀 Starting SignalR connection...");
      await this.connection.start();
      console.log("✅ SignalR connected successfully");
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("❌ SignalR connection error:", error);
      this.callbacks.onError?.(`Failed to connect to chat server: ${error}`);
      this.attemptReconnect();
      return false;
    }
  }

  // Stop SignalR connection
  async stop(): Promise<void> {
    if (this.connection) {
      console.log("🛑 Stopping SignalR connection...");
      await this.connection.stop();
      this.joinedConversations.clear();
    }
  }

  // Attempt to reconnect
  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnect attempts reached");
      this.callbacks.onError?.(
        "Failed to reconnect to chat server. Please refresh the page."
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      2000 * Math.pow(2, this.reconnectAttempts - 1),
      32000
    );

    console.log(
      `🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`
    );

    setTimeout(async () => {
      await this.start();
    }, delay);
  }

  // Rejoin all conversations after reconnect
  private async rejoinConversations() {
    console.log("🔄 Rejoining conversations...");
    const conversations = Array.from(this.joinedConversations);

    for (const conversationId of conversations) {
      if (this.currentUserId) {
        await this.joinConversation(conversationId, this.currentUserId);
      }
    }
  }

  // Join a conversation group
  async joinConversation(
    conversationId: number,
    userId: number
  ): Promise<boolean> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("⚠️ SignalR not connected, attempting to connect...");
      try {
        await this.start();
        // Wait for connection to establish with retries
        let retries = 0;
        const maxRetries = 5;
        while (
          this.connection?.state !== signalR.HubConnectionState.Connected &&
          retries < maxRetries
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries++;
        }

        if (this.connection?.state !== signalR.HubConnectionState.Connected) {
          console.error(
            "❌ Failed to establish SignalR connection after retries"
          );
          return false;
        }
      } catch (error) {
        console.error("❌ Error starting SignalR connection:", error);
        return false;
      }
    }

    try {
      this.currentUserId = userId;
      const groupName = `Conversation_${conversationId}`;

      console.log(
        `🔗 Joining conversation group: ${groupName} for user: ${userId}`
      );

      // Call the JoinConversation method on the hub
      // Backend expects: JoinConversation(string conversationId, string userId)
      await this.connection!.invoke(
        "JoinConversation",
        conversationId.toString(),
        userId.toString()
      );

      this.joinedConversations.add(conversationId);
      console.log(`✅ Joined conversation ${conversationId} as user ${userId}`);

      return true;
    } catch (error) {
      console.error("❌ Error joining conversation:", error);
      this.callbacks.onError?.(`Failed to join conversation: ${error}`);
      return false;
    }
  }

  // Leave a conversation group
  async leaveConversation(conversationId: number): Promise<boolean> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("⚠️ SignalR not connected, cannot leave conversation");
      return false;
    }

    if (!this.currentUserId) {
      console.warn("⚠️ No userId available, cannot leave conversation");
      return false;
    }

    try {
      const groupName = `Conversation_${conversationId}`;
      const userId = this.currentUserId;

      console.log(
        `👋 Leaving conversation group: ${groupName} for user: ${userId}`
      );

      // Call the LeaveConversation method on the hub
      // Backend expects: LeaveConversation(string conversationId, string userId)
      await this.connection.invoke(
        "LeaveConversation",
        conversationId.toString(),
        userId.toString()
      );

      this.joinedConversations.delete(conversationId);
      console.log(`✅ Left conversation ${conversationId} as user ${userId}`);

      return true;
    } catch (error) {
      console.error("❌ Error leaving conversation:", error);
      return false;
    }
  }

  // Set callback functions
  setCallbacks(callbacks: ChatConnectionCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Clear all callbacks
  clearCallbacks() {
    this.callbacks = {};
  }

  // Get current user ID
  get userId(): number | null {
    return this.currentUserId;
  }

  // Check if connected
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Get connection state
  get connectionState(): string {
    return this.connection?.state || "Disconnected";
  }

  // Get list of joined conversations
  get activeConversations(): number[] {
    return Array.from(this.joinedConversations);
  }
}

// Export singleton instance
export const chatSignalRService = new ChatSignalRService();
export default chatSignalRService;
