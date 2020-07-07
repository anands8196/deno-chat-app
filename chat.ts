import {
  isWebSocketCloseEvent,
  WebSocket
} from "https://deno.land/std/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

interface IUser {
  userId: string;
  name: string;
  groupName: string;
  ws: WebSocket;
}

/**
 * userId: {
 *    userId: string,
 *    name: string,
 *    groupName: string,
 *    ws: WebSocket
 * }
 */
const usersMap = new Map<string, IUser>();

/**
 * groupName: [user1, user2]
 *
 * {
 *    userId: string,
 *    name: string,
 *    groupName: string,
 *    ws: WebSocket
 * }
 */
const groupsMap = new Map<string, IUser[]>();

/**
 * groupName: [message1,message2]
 *
 * {
 *    userId: string,
 *    name: string,
 *    message: string
 * }
 *
 */
interface IMessage {
  userId: string;
  name: string;
  message: string;
}
const messagesMap = new Map<string, IMessage[]>();

// This is called when user is connected
export default async function chat(ws: WebSocket) {
  // Generate unique userId
  const userId = v4.generate();

  // Listening of WebSocket events
  for await (let data of ws) {
    const event = typeof data === "string" ? JSON.parse(data) : data;

    // If event is close,
    if (isWebSocketCloseEvent(data)) {
      // Take out user from usersMap
      leaveGroup(userId);
      break;
    }

    let userObj;
    // Check received data.event
    switch (event.event) {
      // If it is join
      case "join":
        // Create userObj with ws, groupName and name
        userObj = {
          userId,
          name: event.name,
          groupName: event.groupName,
          ws
        };

        // Put userObj inside usersMap
        usersMap.set(userId, userObj);

        // Take out users from groupsMap
        const users = groupsMap.get(event.groupName) ?? [];
        users.push(userObj);
        groupsMap.set(event.groupName, users);

        // Emit to all users in this group that new user joined.
        emitUserList(event.groupName);
        // Emit all previous messages sent in this group to newly joined user
        emitPreviousMessages(event.groupName, ws);
        break;
      // If it is message receive
      case "message":
        userObj = usersMap.get(userId);
        const message = <IMessage>{
          userId,
          name: userObj?.name,
          message: event.data
        };
        const messages = messagesMap.get(userObj?.groupName ?? "") ?? [];
        messages.push(message);
        messagesMap.set(userObj?.groupName ?? "", messages);
        emitMessage(userObj?.groupName ?? "", message, userId);
        break;
    }
  }
}

function emitUserList(groupName: string) {
  // Get users from groupsMap
  const users = groupsMap.get(groupName) || [];
  // Iterate over users and send list of users to every user in the group
  for (const user of users) {
    const event = {
      event: "users",
      data: getDisplayUsers(groupName)
    };
    user.ws.send(JSON.stringify(event));
  }
}

function getDisplayUsers(groupName: string) {
  const users = groupsMap.get(groupName) || [];
  return users.map((u) => {
    return { userId: u.userId, name: u.name };
  });
}

function emitMessage(groupName: string, message: IMessage, senderId: string) {
  const users = groupsMap.get(groupName) || [];
  for (const user of users) {
    const tmpMessage = {
      ...message,
      sender: user.userId === senderId ? "me" : senderId
    };
    const event = {
      event: "message",
      data: tmpMessage
    };
    user.ws.send(JSON.stringify(event));
  }
}

function emitPreviousMessages(groupName: string, ws: WebSocket) {
  const messages = messagesMap.get(groupName) || [];

  const event = {
    event: "previousMessages",
    data: messages
  };
  ws.send(JSON.stringify(event));
}

function leaveGroup(userId: string) {
  // Take out users from groupsMap
  const userObj = usersMap.get(userId);
  if (!userObj) {
    return;
  }
  let users = groupsMap.get(userObj.groupName) || [];

  // Remove current user from users and write users back into groupsMap
  users = users.filter((u) => u.userId !== userId);
  groupsMap.set(userObj.groupName, users);

  // Remove userId from usersMap
  usersMap.delete(userId);

  emitUserList(userObj.groupName);
}
