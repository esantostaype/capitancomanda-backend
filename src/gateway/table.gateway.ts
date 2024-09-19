import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { TableStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',  // Puedes cambiar el origen si tu frontend tiene una URL específica
  },
})
export class TableGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(private prisma: PrismaService) {}

  afterInit() {
    console.log('Socket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Evento para seleccionar mesa
  @SubscribeMessage('selectTable')
  async handleTableSelection(client: Socket, payload: { tableId: string, userId: string }) {
    const { tableId, userId } = payload;

    // Verificar si la mesa ya está seleccionada
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: { orders: true }, // Incluimos las órdenes relacionadas
    });

    if (!table) {
      return client.emit('error', 'Mesa no encontrada');
    }

    if (table.status !== 'AVAILABLE') {
      return client.emit('error', 'La mesa ya está ocupada');
    }

    // Actualizamos el estado de la mesa a ocupada
    const updatedTable = await this.prisma.table.update({
      where: { id: tableId },
      data: {
        status: TableStatus.OCCUPIED_AWAITING_ORDER
      }
    });

    // Emitimos el evento a todos los usuarios conectados
    this.server.emit('tableSelected', {
      tableId: updatedTable.id,
      status: updatedTable.status,
      userId,
    });
  }

  // Evento para liberar mesa
  @SubscribeMessage('releaseTable')
  async handleTableRelease(client: Socket, payload: { tableId: string }) {
    const { tableId } = payload;

    // Verificar si la mesa está ocupada
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.status === 'AVAILABLE') {
      return client.emit('error', 'La mesa ya está disponible');
    }

    // Actualizamos el estado de la mesa a disponible
    const updatedTable = await this.prisma.table.update({
      where: { id: tableId },
      data: { status: 'AVAILABLE' }
    });

    // Emitimos el evento a todos los usuarios conectados
    this.server.emit('tableReleased', {
      tableId: updatedTable.id,
      status: updatedTable.status,
    });
  }
}
