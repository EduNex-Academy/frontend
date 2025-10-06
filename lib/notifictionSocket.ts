"use client";

import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

let stompClient: Client | null = null;

export function connectToNotifications(
  userId: string,
  onMessage: (notification: any) => void
) {
  const socket = new SockJS("http://localhost:8080/ws-notifications");
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    reconnectDelay: 5000, // auto-reconnect
  });

  stompClient.onConnect = () => {
    console.log("✅ Connected to WebSocket");

    // Subscribe to user notifications
    stompClient?.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
      if (message.body) {
        const notif = JSON.parse(message.body);
        onMessage(notif);
      }
    });
  };

  stompClient.onStompError = (frame) => {
    console.error("STOMP error:", frame.headers["message"]);
  };

  stompClient.onWebSocketError = (err) => {
    console.error("WebSocket error:", err);
  };

  stompClient.activate();
}

export function disconnectNotifications() {
  if (stompClient) {
    stompClient.deactivate();
    console.log("Disconnected from notifications");
  }
}
