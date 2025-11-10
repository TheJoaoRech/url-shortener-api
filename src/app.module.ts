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

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: nodeEnv === 'development',
          logging: false,
          ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
          connectTimeoutMS: 5000,
          maxQueryExecutionTime: 5000,
          extra: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 5000,
            connectionTimeoutMillis: 5000,
            statement_timeout: 5000,
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
