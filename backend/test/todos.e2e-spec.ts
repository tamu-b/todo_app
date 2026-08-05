import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { configureApp } from './../src/app.config';

type TodoResponseBody = {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
};

describe('TodoのE2Eテスト', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.todo.deleteMany();
  });

  it('作成→取得→更新→削除の一連の流れが正しく動作する', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/todos')
      .send({
        title: 'Buy milk',
        description: 'Whole milk, 1L',
        dueDate: '2026-01-01',
      })
      .expect(201);

    const created = createResponse.body as TodoResponseBody;
    expect(created).toEqual({
      id: expect.any(Number) as number,
      title: 'Buy milk',
      description: 'Whole milk, 1L',
      dueDate: '2026-01-01',
    });
    const id = created.id;

    await request(app.getHttpServer())
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([created]);
      });

    await request(app.getHttpServer())
      .get(`/todos/${id}`)
      .expect(200)
      .expect(created);

    const updateResponse = await request(app.getHttpServer())
      .put(`/todos/${id}`)
      .send({
        title: 'Buy oat milk',
        description: 'Unsweetened, 1L',
        dueDate: '2026-02-01',
      })
      .expect(200);

    const updated = updateResponse.body as TodoResponseBody;
    expect(updated).toMatchObject({
      id,
      title: 'Buy oat milk',
      description: 'Unsweetened, 1L',
      dueDate: '2026-02-01',
    });

    await request(app.getHttpServer())
      .get(`/todos/${id}`)
      .expect(200)
      .expect(updated);

    await request(app.getHttpServer()).delete(`/todos/${id}`).expect(200);

    await request(app.getHttpServer()).get(`/todos/${id}`).expect(404);
    await request(app.getHttpServer()).get('/todos').expect(200).expect([]);
  });

  describe('createの正常系', () => {
    const validPayload = {
      title: 'title',
      description: 'description',
      dueDate: '2026-01-01',
    };

    it.each([
      {
        label: 'dueDateを指定した場合、そのまま作成される',
        payload: validPayload,
        expected: {
          title: 'title',
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'dueDateがundefinedの場合、nullとして作成される',
        payload: { title: 'title', description: 'description' },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: null,
        },
      },
      {
        label: 'dueDateがnullの場合、nullとして作成される',
        payload: { title: 'title', description: 'description', dueDate: null },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: null,
        },
      },
      {
        label: 'titleが1文字でも作成できる',
        payload: { ...validPayload, title: 'a' },
        expected: {
          title: 'a',
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'titleが191文字でも作成できる',
        payload: { ...validPayload, title: 'a'.repeat(191) },
        expected: {
          title: 'a'.repeat(191),
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'titleが日本語の191文字でも作成できる',
        payload: { ...validPayload, title: 'あ'.repeat(191) },
        expected: {
          title: 'あ'.repeat(191),
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'descriptionが1文字でも作成できる',
        payload: { ...validPayload, description: 'a' },
        expected: { title: 'title', description: 'a', dueDate: '2026-01-01' },
      },
      {
        label: 'descriptionが191文字でも作成できる',
        payload: { ...validPayload, description: 'a'.repeat(191) },
        expected: {
          title: 'title',
          description: 'a'.repeat(191),
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'descriptionが日本語の191文字でも作成できる',
        payload: { ...validPayload, description: 'あ'.repeat(191) },
        expected: {
          title: 'title',
          description: 'あ'.repeat(191),
          dueDate: '2026-01-01',
        },
      },
    ])('$label', async ({ payload, expected }) => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number) as number,
        ...expected,
      });
    });
  });

  describe('createのバリデーション', () => {
    const validPayload = {
      title: 'title',
      description: 'description',
      dueDate: '2026-01-01',
    };

    it.each([
      {
        label: 'titleがundefinedの場合は拒否する',
        payload: { ...validPayload, title: undefined },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは文字列で入力してください',
      },
      {
        label: 'titleがnullの場合は拒否する',
        payload: { ...validPayload, title: null },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは文字列で入力してください',
      },
      {
        label: 'titleが空文字の場合は拒否する',
        payload: { ...validPayload, title: '' },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは1文字以上で入力してください',
      },
      {
        label: 'titleが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, title: 'a'.repeat(192) },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは191文字以内で入力してください',
      },
      {
        label: 'descriptionがundefinedの場合は拒否する',
        payload: { ...validPayload, description: undefined },
        expectedProperty: 'description',
        expectedMessage: '説明は文字列で入力してください',
      },
      {
        label: 'descriptionがnullの場合は拒否する',
        payload: { ...validPayload, description: null },
        expectedProperty: 'description',
        expectedMessage: '説明は文字列で入力してください',
      },
      {
        label: 'descriptionが空文字の場合は拒否する',
        payload: { ...validPayload, description: '' },
        expectedProperty: 'description',
        expectedMessage: '説明は1文字以上で入力してください',
      },
      {
        label: 'descriptionが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, description: 'a'.repeat(192) },
        expectedProperty: 'description',
        expectedMessage: '説明は191文字以内で入力してください',
      },
      {
        label: 'dueDateが不正な日付文字列の場合は拒否する',
        payload: { ...validPayload, dueDate: 'not-a-date' },
        expectedProperty: 'dueDate',
        expectedMessage: '期限は有効な日付を入力してください',
      },
    ])('$label', async ({ payload, expectedProperty, expectedMessage }) => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        type: 'validation_error',
        statusCode: 400,
        message: { [expectedProperty]: { messages: [expectedMessage] } },
        error: 'Bad Request',
      });
    });
  });

  describe('updateの正常系', () => {
    const validPayload = {
      title: 'title',
      description: 'description',
      dueDate: '2026-01-01',
    };

    const createTodo = async (): Promise<number> => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'original title',
          description: 'original description',
          dueDate: '2020-01-01',
        })
        .expect(201);
      return (response.body as TodoResponseBody).id;
    };

    it.each([
      {
        label: 'dueDateを指定した場合、そのまま更新される',
        payload: validPayload,
        expected: {
          title: 'title',
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'dueDateがundefinedの場合、nullとして更新される',
        payload: { title: 'title', description: 'description' },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: null,
        },
      },
      {
        label: 'dueDateがnullの場合、nullとして更新される',
        payload: { title: 'title', description: 'description', dueDate: null },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: null,
        },
      },
      {
        label: 'titleが1文字でも更新できる',
        payload: { ...validPayload, title: 'a' },
        expected: {
          title: 'a',
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'titleが191文字でも更新できる',
        payload: { ...validPayload, title: 'a'.repeat(191) },
        expected: {
          title: 'a'.repeat(191),
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'titleが日本語の191文字でも更新できる',
        payload: { ...validPayload, title: 'あ'.repeat(191) },
        expected: {
          title: 'あ'.repeat(191),
          description: 'description',
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'descriptionが1文字でも更新できる',
        payload: { ...validPayload, description: 'a' },
        expected: { title: 'title', description: 'a', dueDate: '2026-01-01' },
      },
      {
        label: 'descriptionが191文字でも更新できる',
        payload: { ...validPayload, description: 'a'.repeat(191) },
        expected: {
          title: 'title',
          description: 'a'.repeat(191),
          dueDate: '2026-01-01',
        },
      },
      {
        label: 'descriptionが日本語の191文字でも更新できる',
        payload: { ...validPayload, description: 'あ'.repeat(191) },
        expected: {
          title: 'title',
          description: 'あ'.repeat(191),
          dueDate: '2026-01-01',
        },
      },
    ])('$label', async ({ payload, expected }) => {
      const id = await createTodo();

      const response = await request(app.getHttpServer())
        .put(`/todos/${id}`)
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        id,
        ...expected,
      });
    });
  });

  describe('updateのバリデーション', () => {
    const validPayload = {
      title: 'title',
      description: 'description',
      dueDate: '2026-01-01',
    };

    it.each([
      {
        label: 'titleがundefinedの場合は拒否する',
        payload: { ...validPayload, title: undefined },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは文字列で入力してください',
      },
      {
        label: 'titleがnullの場合は拒否する',
        payload: { ...validPayload, title: null },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは文字列で入力してください',
      },
      {
        label: 'titleが空文字の場合は拒否する',
        payload: { ...validPayload, title: '' },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは1文字以上で入力してください',
      },
      {
        label: 'titleが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, title: 'a'.repeat(192) },
        expectedProperty: 'title',
        expectedMessage: 'タイトルは191文字以内で入力してください',
      },
      {
        label: 'descriptionがundefinedの場合は拒否する',
        payload: { ...validPayload, description: undefined },
        expectedProperty: 'description',
        expectedMessage: '説明は文字列で入力してください',
      },
      {
        label: 'descriptionがnullの場合は拒否する',
        payload: { ...validPayload, description: null },
        expectedProperty: 'description',
        expectedMessage: '説明は文字列で入力してください',
      },
      {
        label: 'descriptionが空文字の場合は拒否する',
        payload: { ...validPayload, description: '' },
        expectedProperty: 'description',
        expectedMessage: '説明は1文字以上で入力してください',
      },
      {
        label: 'descriptionが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, description: 'a'.repeat(192) },
        expectedProperty: 'description',
        expectedMessage: '説明は191文字以内で入力してください',
      },
      {
        label: 'dueDateが不正な日付文字列の場合は拒否する',
        payload: { ...validPayload, dueDate: 'not-a-date' },
        expectedProperty: 'dueDate',
        expectedMessage: '期限は有効な日付を入力してください',
      },
    ])('$label', async ({ payload, expectedProperty, expectedMessage }) => {
      const response = await request(app.getHttpServer())
        .put('/todos/999999')
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        type: 'validation_error',
        statusCode: 400,
        message: { [expectedProperty]: { messages: [expectedMessage] } },
        error: 'Bad Request',
      });
    });
  });

  it('存在しないtodoを取得しようとすると404を返す', async () => {
    const response = await request(app.getHttpServer())
      .get('/todos/999999')
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Todo with id 999999 not found',
      error: 'Not Found',
    });
  });

  it('数値でないidでtodoを取得しようとすると400を返す', async () => {
    const response = await request(app.getHttpServer())
      .get('/todos/abc')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'Validation failed (numeric string is expected)',
      error: 'Bad Request',
    });
  });

  it('存在しないtodoを更新しようとすると404を返す', async () => {
    const response = await request(app.getHttpServer())
      .put('/todos/999999')
      .send({ title: 'title', description: 'description' })
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Todo with id 999999 not found',
      error: 'Not Found',
    });
  });

  it('数値でないidでtodoを更新しようとすると400を返す', async () => {
    const response = await request(app.getHttpServer())
      .put('/todos/abc')
      .send({ title: 'title', description: 'description' })
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'Validation failed (numeric string is expected)',
      error: 'Bad Request',
    });
  });

  it('存在しないtodoを削除しようとすると404を返す', async () => {
    const response = await request(app.getHttpServer())
      .delete('/todos/999999')
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Todo with id 999999 not found',
      error: 'Not Found',
    });
  });

  it('数値でないidでtodoを削除しようとすると400を返す', async () => {
    const response = await request(app.getHttpServer())
      .delete('/todos/abc')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'Validation failed (numeric string is expected)',
      error: 'Bad Request',
    });
  });
});
