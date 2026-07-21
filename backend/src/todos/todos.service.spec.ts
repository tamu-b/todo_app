import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '../common/errors/not-found.error';
import { TodosService } from './todos.service';
import { TodosRepository } from './todos.repository';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodosService', () => {
  let service: TodosService;
  let repository: jest.Mocked<TodosRepository>;

  const buildTodo = (overrides: Partial<Todo> = {}): Todo =>
    Object.assign(new Todo(), {
      id: 1,
      title: 'title',
      description: 'description',
      dueDate: null,
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TodosRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TodosService);
    repository = module.get(TodosRepository);
  });

  describe('findAll', () => {
    it('リポジトリから全てのTodoを返す', async () => {
      const todos = [buildTodo({ id: 1 }), buildTodo({ id: 2 })];
      repository.findAll.mockResolvedValue(todos);

      await expect(service.findAll()).resolves.toEqual(todos);
    });
  });

  describe('findOne', () => {
    it('Todoが存在する場合はそのTodoを返す', async () => {
      const todo = buildTodo();
      repository.findById.mockResolvedValue(todo);

      await expect(service.findOne(1)).resolves.toEqual(todo);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('Todoが存在しない場合はNotFoundErrorをスローする', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundError);
      await expect(service.findOne(999)).rejects.toThrow(
        'Todo with id 999 not found',
      );
    });
  });

  describe('create', () => {
    it('指定された期限日でTodoを作成する', async () => {
      const dto: CreateTodoDto = {
        title: 'title',
        description: 'description',
        dueDate: new Date('2026-01-01'),
      };
      const created = buildTodo({ dueDate: dto.dueDate });
      repository.create.mockResolvedValue(created);

      await expect(service.create(dto)).resolves.toEqual(created);
      expect(repository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
      });
    });

    it('期限日が指定されない場合はnullをデフォルト値とする', async () => {
      const dto: CreateTodoDto = {
        title: 'title',
        description: 'description',
      };
      repository.create.mockResolvedValue(buildTodo());

      await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        dueDate: null,
      });
    });
  });

  describe('update', () => {
    it('Todoが存在する場合はそのTodoを更新する', async () => {
      const dto: UpdateTodoDto = {
        title: 'new title',
        description: 'new description',
        dueDate: new Date('2026-02-01'),
      };
      const updated = buildTodo({
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
      });
      repository.update.mockResolvedValue(updated);

      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(1, {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
      });
    });

    it('期限日が指定されない場合はnullをデフォルト値とする', async () => {
      const dto: UpdateTodoDto = {
        title: 'new title',
        description: 'new description',
      };
      repository.update.mockResolvedValue(buildTodo());

      await service.update(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        title: dto.title,
        description: dto.description,
        dueDate: null,
      });
    });

    it('Todoが存在しない場合はNotFoundErrorをスローする', async () => {
      repository.update.mockRejectedValue(
        new NotFoundError('Todo with id 999 not found'),
      );

      await expect(
        service.update(999, {
          title: 'title',
          description: 'description',
        }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update(999, {
          title: 'title',
          description: 'description',
        }),
      ).rejects.toThrow('Todo with id 999 not found');
    });
  });

  describe('remove', () => {
    it('Todoが存在する場合はそのTodoを削除する', async () => {
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
    });

    it('Todoが存在しない場合はNotFoundErrorをスローする', async () => {
      repository.remove.mockRejectedValue(
        new NotFoundError('Todo with id 999 not found'),
      );

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      await expect(service.remove(999)).rejects.toThrow(
        'Todo with id 999 not found',
      );
    });
  });
});
