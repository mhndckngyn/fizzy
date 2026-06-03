# fizzy
- 37signals' [Fizzy](https://github.com/basecamp/fizzy)

## Cách chạy

### Cài đặt
- [Bun](https://bun.com/)
- [.NET 9](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- PostgreSQL
- [EF Core](https://learn.microsoft.com/en-us/ef/core/get-started/overview/install)

### Setup root folder
- Ở folder root, cài thư viện để chạy hook pre-commit (format code):

```sh
bun install
dotnet tool restore
```

### Setup Auth Server
- Tạo project [Resend](https://resend.com/) (gửi mã OTP)
- Setup PostgreSQL - Auth Server sẽ chạy trên schema `auth`
- Nhập secret vào file `.env` (tham khảo `.env.example`)

```
BETTER_AUTH_SECRET="" # openssl rand -base64 32
BETTER_AUTH_URL=""

DATABASE_URL=""

RESEND_SECRET_KEY=""
```

- Setup Database:

```sh
bunx prisma generate
bunx prisma db push 
```

- Chạy Auth Server:

```sh
cd auth-server
bun install

# Run
bun dev
```

### Setup Backend Server
- Sử dụng [user-secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) để lưu secret

```sh
cd ./api-app/Feature
dotnet user-secrets init

# PostgreSQL connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-connection-string>"

# Lấy base url từ Auth Server
dotnet user-secrets set "AuthApi:BaseUrl" "<auth-api-base-url>/api/auth"
dotnet user-secrets set "AuthApi:JwksUrl" "<auth-api-base-url>/api/auth/jwks"
dotnet user-secrets set "AuthApi:Issuer" "<auth-api-base-url>"

# Audience: .NET App
dotnet user-secrets set "AuthApi:Audience" "<jwt-audience>"
```

- Setup Database (migration)

```sh
cd ./api-app
dotnet ef database update --project Infrastructure --startup-project Feature
```

- Chạy Backend App:

```sh
cd ./api-app/Feature
dotnet run
```

### Setup Mobile App
- Chạy Auth Server & Backend Server trước
- Ở môi trường local, khi sử dụng app Expo, cần mở tunnel (vd: [Cloudflared](https://github.com/cloudflare/cloudflared#installing-cloudflared)) đến 2 Server:

```sh
cloudflared tunnel --url http://localhost:xxxx # Thay thế bằng cổng mà backend và auth server đang chạy 
```

- Lấy 2 URL được tạo bởi cloudflared và thay vào file `.env` (tham khảo `.env.example`)
```
EXPO_PUBLIC_AUTH_BASE_URL=
EXPO_PUBLIC_API_BASE_URL=
``` 

- Chạy Mobile App:

```sh
cd mobile-app
bun install

# Run
bun dev # có thể thêm flag --tunnel nếu bị lỗi
```
