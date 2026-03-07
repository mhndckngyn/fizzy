# fizzy

## Cách chạy

### Cài đặt
- [Bun](https://bun.com/)
- [.NET 9](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)

### Setup root folder
(Ở folder root t cài thư viện để tự động format code khi commit)

```sh
bun install
dotnet restore
```

### Setup Auth server
```sh
cd auth-server
bun install

# Trước khi chạy lần đầu
bunx prisma db pull
bunx prisma generate

# Run
bun dev
```
- Nếu chạy `bunx prisma db push` thì để ý tránh để nó xóa data nha

### Setup Web app
```sh
cd web-app
bun install

# Run
bun dev
```

### Setup Mobile app
```sh
cd mobile-app
bun install

# Run
bun dev
```
