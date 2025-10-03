import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class Last10Gateway {
    @WebSocketServer()
    server: Server;
    emitLast10(list: any[]) {
        this.server.emit('last10', list);
    }
}