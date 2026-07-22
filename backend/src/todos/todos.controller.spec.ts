import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodosController', () => {
  let controller: TodosController;
  let service: jest.Mocked<TodosService>;

  const todo: Todo = Object.assign(new Todo(), {
    id: 1,
    title: 'title',
    description: 'description',
    dueDate: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TodosController);
    service = module.get(TodosService);
  });

  it('findAllはserviceに処理を委譲する', async () => {
    service.findAll.mockResolvedValue([todo]);

    await expect(controller.findAll()).resolves.toEqual([todo]);
  });

  it('findOneはパースされたidでserviceに処理を委譲する', async () => {
    service.findOne.mockResolvedValue(todo);

    await expect(controller.findOne(1)).resolves.toEqual(todo);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('createはdtoでserviceに処理を委譲する', async () => {
    const dto: CreateTodoDto = { title: 'title', description: 'description' };
    service.create.mockResolvedValue(todo);

    await expect(controller.create(dto)).resolves.toEqual(todo);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('updateはidとdtoでserviceに処理を委譲する', async () => {
    const dto: UpdateTodoDto = {
      title: 'new title',
      description: 'new description',
    };
    service.update.mockResolvedValue(todo);

    await expect(controller.update(1, dto)).resolves.toEqual(todo);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('removeはパースされたidでserviceに処理を委譲する', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
