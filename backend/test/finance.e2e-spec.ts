import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

describe('Finance & Wallets (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let familyId: string;

  const testUser = {
    email: 'finance-test@yumna.com',
    password: 'Password123!',
    name: 'Finance User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    prisma = app.get(PrismaService);

    // 1. Cleanup
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    
    // 2. Create Family
    const family = await prisma.family.create({
      data: { name: 'Test Finance Family' },
    });
    familyId = family.id;

    // 3. Register & Login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...testUser, familyId });
    
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    jwtToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.wallet.deleteMany({ where: { familyId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.family.delete({ where: { id: familyId } });
    await app.close();
  });

  describe('/finance/wallets (GET)', () => {
    it('should return wallets for the authenticated family', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/wallets')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
