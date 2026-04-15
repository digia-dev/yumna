import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Logger as PinoLogger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  // ── 429: Gzip/Brotli Response Compression ──────────────────────────────
  // compression() uses zlib — prefers Brotli if client sends Accept-Encoding: br
  app.use(compression({
    level: 6,         // zlib compression level (1=fast, 9=max) — 6 is balanced
    threshold: 1024,  // Only compress responses > 1KB
    filter: (req: any, res: any) => {
      // Don't compress already-compressed images/audio/video
      const contentType = res.getHeader('Content-Type') as string || '';
      if (/image|audio|video/.test(contentType)) return false;
      return compression.filter(req, res);
    },
  }));

  // ── 421: HTTPS / Trust Proxy ────────────────────────────────────────────
  // When running behind a reverse proxy (Nginx / Vercel / Railway),
  // trust the X-Forwarded-Proto header so we can redirect HTTP→HTTPS
  app.set('trust proxy', 1);

  // ── 421: Enforce HTTPS in production ───────────────────────────────────
  if (isProduction) {
    app.use((req: any, res: any, next: () => void) => {
      const proto = req.headers['x-forwarded-proto'] || req.protocol;
      if (proto !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // ── 422 + 425: Helmet Security Headers (hardened) ──────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc:     ["'self'"],
          scriptSrc:      ["'self'"],
          styleSrc:       ["'self'", "'unsafe-inline'"],
          imgSrc:         ["'self'", 'data:', 'https:'],
          connectSrc:     ["'self'", 'https:', 'wss:'],
          frameSrc:       ["'none'"],
          objectSrc:      ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      // 421: HSTS — forces browsers to use HTTPS for 1 year
      hsts: isProduction
        ? { maxAge: 63_072_000, includeSubDomains: true, preload: true }
        : false,
      crossOriginEmbedderPolicy: false, // Allow API clients
    }),
  );

  // ── 422: Strict CORS configuration ─────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Swagger)
      if (!origin) { callback(null, true); return; }
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    methods:            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:     ['Authorization', 'Content-Type', 'X-Request-ID'],
    exposedHeaders:     ['X-Request-ID'],
    credentials:        true,
    maxAge:             86_400, // CORS preflight cache: 1 day
  });

  // ── 438: Request ID tracking ────────────────────────────────────────────
  app.use((req: any, res: any, next: () => void) => {
    const requestId =
      (req.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  app.useLogger(app.get(PinoLogger));

  // ── Swagger (non-production only) ───────────────────────────────────────
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Yumna API')
      .setDescription('Yumna Family Finance API — Rahmatan lil alamin')
      .setVersion('1.0')
      .addTag('yumna')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger UI available at /api/docs');
  }

  // ── Global Validation Pipe (422: whitelist + forbidNonWhitelisted) ──────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,// 422: reject unknown fields (prevents mass-assignment)
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`🚀 Yumna API running on port ${port} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  logger.log(`🔒 Security: Helmet ✓ | CORS strict ✓ | Throttle ✓ | RequestID ✓ | HTTPS${isProduction ? ' ✓' : ' (dev)'}`);
}
bootstrap();
