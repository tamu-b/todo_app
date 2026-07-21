import createPrismaMock from 'prisma-mock/client';
import * as dmmf from '../generated/dmmf';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { PrismaTodosRepository } from './prisma-todos.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaErrorCode } from '../prisma/prisma-error-codes';

describe('PrismaTodosRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaTodosRepository;

  beforeEach(() => {
    prisma = createPrismaMock(Prisma, { datamodel: dmmf });
    repository = new PrismaTodosRepository(prisma as PrismaService);
  });

  describe('findAll', () => {
    it('永続化された全ての行をTodoエンティティに変換する', async () => {
      await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      const result = await repository.findAll();

      expect(result).toEqual([
        {
          id: expect.any(Number) as number,
          title: 'title',
          description: 'description',
          dueDate: new Date('2026-01-01'),
        },
      ]);
    });

    it('データが0件の場合は空配列を返す', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('データが2件の場合は両方をTodoエンティティに変換する', async () => {
      await prisma.todo.create({
        data: {
          title: 'title1',
          description: 'description1',
          due_date: new Date('2026-01-01'),
        },
      });
      await prisma.todo.create({
        data: {
          title: 'title2',
          description: 'description2',
          due_date: null,
        },
      });

      const result = await repository.findAll();

      expect(result).toEqual([
        {
          id: expect.any(Number) as number,
          title: 'title1',
          description: 'description1',
          dueDate: new Date('2026-01-01'),
        },
        {
          id: expect.any(Number) as number,
          title: 'title2',
          description: 'description2',
          dueDate: null,
        },
      ]);
    });
  });

  describe('findById', () => {
    it('見つかった場合は変換されたTodoを返す', async () => {
      const created = await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      const result = await repository.findById(created.id);

      expect(result).toEqual({
        id: created.id,
        title: 'title',
        description: 'description',
        dueDate: new Date('2026-01-01'),
      });
    });

    it('見つからない場合はnullを返す', async () => {
      await expect(repository.findById(999999)).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('渡されたデータを永続化し、変換されたTodoを返す', async () => {
      const result = await repository.create({
        title: 'title',
        description: 'description',
        dueDate: new Date('2026-01-01'),
      });

      expect(result).toEqual({
        id: expect.any(Number) as number,
        title: 'title',
        description: 'description',
        dueDate: new Date('2026-01-01'),
      });

      const persisted = await prisma.todo.findUnique({
        where: { id: result.id },
      });
      expect(persisted).toStrictEqual({
        id: result.id,
        title: 'title',
        description: 'description',
        due_date: new Date('2026-01-01'),
      });
    });

    it('dueDateがnullの場合も永続化し、変換されたTodoを返す', async () => {
      const result = await repository.create({
        title: 'title',
        description: 'description',
        dueDate: null,
      });

      expect(result).toEqual({
        id: expect.any(Number) as number,
        title: 'title',
        description: 'description',
        dueDate: null,
      });

      const persisted = await prisma.todo.findUnique({
        where: { id: result.id },
      });
      expect(persisted).toStrictEqual({
        id: result.id,
        title: 'title',
        description: 'description',
        due_date: null,
      });
    });
  });

  describe('update', () => {
    it('渡された部分的なデータのみを永続化し、変換されたTodoを返す', async () => {
      const created = await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      const result = await repository.update(created.id, {
        title: 'updated',
      });

      expect(result).toEqual({
        id: created.id,
        title: 'updated',
        description: 'description',
        dueDate: new Date('2026-01-01'),
      });
    });

    it('全てのフィールドを渡した場合は全て更新する', async () => {
      const created = await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      const result = await repository.update(created.id, {
        title: 'updated title',
        description: 'updated description',
        dueDate: new Date('2026-02-02'),
      });

      expect(result).toEqual({
        id: created.id,
        title: 'updated title',
        description: 'updated description',
        dueDate: new Date('2026-02-02'),
      });
    });

    it('dueDateにnullを渡した場合はnullに更新する', async () => {
      const created = await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      const result = await repository.update(created.id, {
        dueDate: null,
      });

      expect(result).toEqual({
        id: created.id,
        title: 'title',
        description: 'description',
        dueDate: null,
      });
    });

    it('存在しないidを指定した場合はエラーを投げる', async () => {
      await expect(
        repository.update(999999, { title: 'updated' }),
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
      await expect(
        repository.update(999999, { title: 'updated' }),
      ).rejects.toMatchObject({ code: PrismaErrorCode.RecordNotFound });
    });
  });

  describe('remove', () => {
    it('idを指定してtodoを削除する', async () => {
      const created = await prisma.todo.create({
        data: {
          title: 'title',
          description: 'description',
          due_date: new Date('2026-01-01'),
        },
      });

      await repository.remove(created.id);

      await expect(
        prisma.todo.findUnique({ where: { id: created.id } }),
      ).resolves.toBeNull();
    });

    it('存在しないidを指定した場合はエラーを投げる', async () => {
      await expect(repository.remove(999999)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
      await expect(repository.remove(999999)).rejects.toMatchObject({
        code: PrismaErrorCode.RecordNotFound,
      });
    });
  });
});
