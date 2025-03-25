import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  public server: Server;
  private users = new Map<string, string>(); 

  handleConnection(client: Socket) {
    console.log(client.id, 'connected');
  }

  handleDisconnect(client: Socket) {
    console.log(client.id, 'disconnected');
    for (const [userId, socketId] of this.users) {
      if (socketId === client.id) {
        this.users.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('newOrder')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.broadcast.emit('new', { message: 'Ordered', data });
  }

  @SubscribeMessage('private')
  handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const to = data.user_id;
    const socket_id = this.users.get(to);
    if (to && socket_id) { 
      this.server.to(socket_id).emit('new', { ...data, from: client.id });
    }
  }

  @SubscribeMessage('join')
  joinGr(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    if (data.group) { 
      client.join(data.group);
      if (data.user_id) {
        this.users.set(data.user_id, client.id);
      }
    }
  }

  @SubscribeMessage('group-message')
  handleGroupMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (data.group) { 
      this.server.to(data.group).emit('new', data);
    }
  }
}