import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UrlsModule } from './urls/urls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const nodeEnv = configService.get('NODE_ENV');

        console.log('Configuring database connection...');
        console.log('NODE_ENV:', nodeEnv);
        console.log('DATABASE_URL exists:', !!databaseUrl);

        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is not set');
        }

        const isTest = nodeEnv === 'test';
        const timeout = isTest ? 30000 : 5000;

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: nodeEnv === 'development' || isTest,
          logging: false,
          ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
          connectTimeoutMS: timeout,
          maxQueryExecutionTime: timeout,
          extra: {
            max: isTest ? 5 : 1,
            min: 0,
            idleTimeoutMillis: timeout,
            connectionTimeoutMillis: timeout,
            statement_timeout: timeout,
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
    UrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
