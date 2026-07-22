import { Module } from '@nestjs/common';
import { PrismaTodosRepository } from './prisma-todos.repository';
import { TodosController } from './todos.controller';
import { TodosRepository } from './todos.repository';
import { TodosService } from './todos.service';

@Module({
  controllers: [TodosController],
  providers: [
    TodosService,
    { provide: TodosRepository, useClass: PrismaTodosRepository },
  ],
})
export class TodosModule {}
