import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

describe('Zakat Engine (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let familyId: string;

  const testUser = {
    email: 'zakat-test@yumna.com',
    password: 'Password123!',
    name: 'Zakat Manager',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    prisma = app.get(PrismaService);

    // Setup Family & User
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    const family = await prisma.family.create({
      data: { name: 'Zakat Test Family' },
    });
    familyId = family.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...testUser, familyId });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    jwtToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.zakatLog.deleteMany({ where: { familyId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.family.delete({ where: { id: familyId } });
    await app.close();
  });

  describe('/zakat/calculate (POST)', () => {
    it('should calculate Zakat Maal correctly', async () => {
      // 120,000,000 should be above nisab (85 * 1.2jt = 102jt)
      const response = await request(app.getHttpServer())
        .post('/zakat/calculate')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 120000000, type: 'MAAL' })
        .expect(201); // Controller POST defaults to 201

      expect(response.body.data.isObligatory).toBe(true);
      expect(response.body.data.zakatAmount).toBe(3000000); // 2.5% of 120jt
    });

    it('should return zero zakat if below nisab', async () => {
      const response = await request(app.getHttpServer())
        .post('/zakat/calculate')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 10000000, type: 'MAAL' })
        .expect(201);

      expect(response.body.data.isObligatory).toBe(false);
      expect(response.body.data.zakatAmount).toBe(0);
    });
  });

  describe('/zakat/log (POST)', () => {
    it('should log a zakat payment record', async () => {
      const response = await request(app.getHttpServer())
        .post('/zakat/log')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 3000000, type: 'Maal' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe('3000000'); // Prisma returns Decimal as string/number depending on config
    });
  });
});
